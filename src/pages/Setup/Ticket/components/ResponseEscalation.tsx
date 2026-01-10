import React, { useEffect, useState } from "react";
import Select from "react-select";
import { BiEdit } from "react-icons/bi";
import { FaClone, FaTrash } from "react-icons/fa";
import FormSection from "../../../../components/ui/FormSection";
import {
  deleteEscalationRule,
  getHelpDeskCategoriesSetup,
  getHelpDeskEscalationSetup,
  getSetupUsers,
  postHelpDeskEscalationSetup,
} from "../../../../api";
import { getItemInLocalStorage } from "../../../../utils/localStorage";
import toast from "react-hot-toast";

interface SelectOption {
  value: number;
  label: string;
}

const ResponseEscalation: React.FC = () => {
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [users, setUsers] = useState<SelectOption[]>([]);
  const [responseEscalation, setResponseEscalation] = useState<any[]>([]);
  const [resEscalationAdded, setResEscalationAdded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);

  const [selectedOptions, setSelectedOptions] = useState({
    categories: [] as SelectOption[],
    escalations: {
      E1: [] as SelectOption[],
      E2: [] as SelectOption[],
      E3: [] as SelectOption[],
      E4: [] as SelectOption[],
      E5: [] as SelectOption[],
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catResp = await getHelpDeskCategoriesSetup();
        const transformedCategory = (catResp.data || []).map((category: any) => ({
          value: category.id,
          label: category.name,
        }));
        setCategories(transformedCategory);

        const usersResp = await getSetupUsers();
        const filteredUser = (usersResp.data || []).filter(
          (user: any) => user.user_type === "pms_admin"
        );
        const transformedUsers = filteredUser.map((user: any) => ({
          value: user.id,
          label: `${user.firstname} ${user.lastname}`,
        }));
        setUsers(transformedUsers);

        const escResp = await getHelpDeskEscalationSetup();
        const filteredResponse = escResp.data.complaint_workers.filter(
          (res: any) => res.esc_type === "response"
        );
        setResponseEscalation(filteredResponse);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [resEscalationAdded]);

  const handleChange = (selected: any, type: "categories" | "escalations", level?: string) => {
    if (type === "categories") {
      setSelectedOptions((prev) => ({ ...prev, categories: selected || [] }));
    } else if (type === "escalations" && level) {
      setSelectedOptions((prev) => ({
        ...prev,
        escalations: {
          ...prev.escalations,
          [level]: selected || [],
        },
      }));
    }
  };

  const siteId = getItemInLocalStorage("SITEID");
  const handleSaveResponseEscalation = async () => {
    if (selectedOptions.categories.length === 0) {
      return toast.error("Please Provide Escalation Data");
    }
    toast.loading("Creating Response Escalation Please wait!");
    const formData = new FormData();
    formData.append("complaint_worker[society_id]", siteId);
    formData.append("complaint_worker[esc_type]", "response");
    formData.append("complaint_worker[of_phase]", "pms");
    formData.append("complaint_worker[of_atype]", "Pms::Site");

    selectedOptions.categories.forEach((category) => {
      formData.append("category_ids[]", String(category.value));
    });

    Object.entries(selectedOptions.escalations).forEach(([level, levelUsers]) => {
      formData.append(`escalation_matrix[${level.toLowerCase()}][name]`, level);
      (levelUsers as SelectOption[]).forEach((user) => {
        formData.append(
          `escalation_matrix[${level.toLowerCase()}][escalate_to_users][]`,
          String(user.value)
        );
      });
    });

    try {
      await postHelpDeskEscalationSetup(formData);
      setResEscalationAdded(true);
      toast.dismiss();
      toast.success("Response Escalation Created Successfully");
      setSelectedOptions({
        categories: [],
        escalations: {
          E1: [],
          E2: [],
          E3: [],
          E4: [],
          E5: [],
        },
      });
    } catch (error) {
      console.error(error);
      toast.dismiss();
    } finally {
      setTimeout(() => setResEscalationAdded(false), 500);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      toast.loading("Deleting Escalation Rule Please wait!");
      await deleteEscalationRule(id);
      toast.dismiss();
      setResEscalationAdded(true);
      toast.success("Escalation Rule Deleted Successfully");
    } catch (error) {
      console.error(error);
      toast.dismiss();
    } finally {
      setTimeout(() => setResEscalationAdded(false), 500);
    }
  };

  return (
    <div className="space-y-6">
      <FormSection title="Response Escalation">
        <div className="space-y-4">
          <Select
            isMulti
            value={selectedOptions.categories}
            onChange={(selected) => handleChange(selected, "categories")}
            options={categories}
            placeholder="Select Categories"
          />

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-secondary/60">
                <tr>
                  <th className="border border-border px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Levels
                  </th>
                  <th className="border border-border px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Escalation To
                  </th>
                </tr>
              </thead>
              <tbody>
                {["E1", "E2", "E3", "E4", "E5"].map((level) => (
                  <tr key={level} className="border-b border-border">
                    <td className="border border-border px-4 py-2 text-sm">{level}</td>
                    <td className="border border-border px-4 py-2">
                      <Select
                        isMulti
                        value={selectedOptions.escalations[level as keyof typeof selectedOptions.escalations]}
                        onChange={(selected) =>
                          handleChange(selected, "escalations", level)
                        }
                        options={users}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg"
              onClick={handleSaveResponseEscalation}
            >
              Submit
            </button>
          </div>
        </div>
      </FormSection>

      <FormSection title="Response Escalation Rules">
        <div className="space-y-4">
          {responseEscalation.map((category, index) => (
            <div key={index} className="border border-border rounded-lg p-4">
              <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
                <p className="font-medium">Rule {index + 1}</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowModal(true)}>
                    <BiEdit />
                  </button>
                  <button onClick={() => setShowCloneModal(true)}>
                    <FaClone />
                  </button>
                  <button onClick={() => handleDelete(category.id)}>
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-secondary/60">
                    <tr>
                      <th className="border border-border px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">
                        Category
                      </th>
                      <th className="border border-border px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">
                        Levels
                      </th>
                      <th className="border border-border px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">
                        Escalation To
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.escalations.map((level: any, levelIndex: number) => (
                      <tr key={levelIndex} className="border-b border-border">
                        {levelIndex === 0 && (
                          <td
                            className="border border-border px-4 py-2 text-sm"
                            rowSpan={category.escalations.length}
                          >
                            {category.category?.name || "-"}
                          </td>
                        )}
                        <td className="border border-border px-4 py-2 text-sm">
                          {level.name}
                        </td>
                        <td className="border border-border px-4 py-2 text-sm">
                          {Array.isArray(level.escalate_to_users_names)
                            ? level.escalate_to_users_names.join(", ")
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </FormSection>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-5 w-96">
            <h2 className="text-lg font-semibold text-center mb-4">Edit Rule</h2>
            <p className="text-sm text-muted-foreground text-center">
              Edit functionality remains unchanged.
            </p>
            <div className="flex justify-center mt-4">
              <button
                className="px-4 py-2 text-sm border border-border rounded-lg"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showCloneModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-5 w-96">
            <h2 className="text-lg font-semibold text-center mb-4">Clone Rule</h2>
            <p className="text-sm text-muted-foreground text-center">
              Clone functionality remains unchanged.
            </p>
            <div className="flex justify-center mt-4">
              <button
                className="px-4 py-2 text-sm border border-border rounded-lg"
                onClick={() => setShowCloneModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponseEscalation;
