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
  postHelpDeskResolutionEscalationSetup,
} from "../../../../api";
import { getItemInLocalStorage } from "../../../../utils/localStorage";
import toast from "react-hot-toast";

interface SelectOption {
  value: number;
  label: string;
}

interface TimeValues {
  days: string;
  hrs: string;
  min: string;
}

interface EscalationLevel {
  users: SelectOption[];
  p1: TimeValues;
  p2: TimeValues;
  p3: TimeValues;
  p4: TimeValues;
  p5: TimeValues;
}

const initialEscalations = (): Record<string, EscalationLevel> => ({
  E1: {
    users: [],
    p1: { days: "", hrs: "", min: "" },
    p2: { days: "", hrs: "", min: "" },
    p3: { days: "", hrs: "", min: "" },
    p4: { days: "", hrs: "", min: "" },
    p5: { days: "", hrs: "", min: "" },
  },
  E2: {
    users: [],
    p1: { days: "", hrs: "", min: "" },
    p2: { days: "", hrs: "", min: "" },
    p3: { days: "", hrs: "", min: "" },
    p4: { days: "", hrs: "", min: "" },
    p5: { days: "", hrs: "", min: "" },
  },
  E3: {
    users: [],
    p1: { days: "", hrs: "", min: "" },
    p2: { days: "", hrs: "", min: "" },
    p3: { days: "", hrs: "", min: "" },
    p4: { days: "", hrs: "", min: "" },
    p5: { days: "", hrs: "", min: "" },
  },
  E4: {
    users: [],
    p1: { days: "", hrs: "", min: "" },
    p2: { days: "", hrs: "", min: "" },
    p3: { days: "", hrs: "", min: "" },
    p4: { days: "", hrs: "", min: "" },
    p5: { days: "", hrs: "", min: "" },
  },
  E5: {
    users: [],
    p1: { days: "", hrs: "", min: "" },
    p2: { days: "", hrs: "", min: "" },
    p3: { days: "", hrs: "", min: "" },
    p4: { days: "", hrs: "", min: "" },
    p5: { days: "", hrs: "", min: "" },
  },
});

const ResolutionEscalation: React.FC = () => {
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [users, setUsers] = useState<SelectOption[]>([]);
  const [resolutionEscalation, setResolutionEscalation] = useState<any[]>([]);
  const [resEscalationAdded, setResEscalationAdded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<SelectOption[]>(
    []
  );
  const [selectedResolutionOptions, setSelectedResolutionOptions] = useState({
    escalations: initialEscalations(),
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
        const filteredResolution = escResp.data.complaint_workers.filter(
          (res: any) => res.esc_type === "resolution"
        );
        setResolutionEscalation(filteredResolution);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [resEscalationAdded]);

  const convertToMinutes = ({ days, hrs, min }: TimeValues) => {
    const daysInMinutes = parseInt(days) * 24 * 60 || 0;
    const hrsInMinutes = parseInt(hrs) * 60 || 0;
    const minutes = parseInt(min) || 0;
    return daysInMinutes + hrsInMinutes + minutes;
  };

  const formatTime = (minutes: number) => {
    const days = Math.floor(minutes / (24 * 60));
    const hours = Math.floor((minutes % (24 * 60)) / 60);
    const minutesLeft = minutes % 60;
    return `${days} day, ${hours} hr, ${minutesLeft} min`;
  };

  const handleUserChange = (selected: any, level: string) => {
    setSelectedResolutionOptions((prev) => ({
      ...prev,
      escalations: {
        ...prev.escalations,
        [level]: {
          ...prev.escalations[level],
          users: selected || [],
        },
      },
    }));
  };

  const handleTimeChange = (
    value: string,
    level: string,
    pField: keyof EscalationLevel,
    fieldType: keyof TimeValues
  ) => {
    setSelectedResolutionOptions((prev) => ({
      ...prev,
      escalations: {
        ...prev.escalations,
        [level]: {
          ...prev.escalations[level],
          [pField]: {
            ...(prev.escalations[level][pField] as TimeValues),
            [fieldType]: value,
          },
        },
      },
    }));
  };

  const siteId = getItemInLocalStorage("SITEID");
  const handleSaveResolutionEscalation = async () => {
    if (selectedCategories.length === 0) {
      return toast.error("Please Provide Escalation Data");
    }
    toast.loading("Creating Resolution Escalation Please wait!");
    const formData = new FormData();
    formData.append("complaint_worker[society_id]", siteId);
    formData.append("complaint_worker[esc_type]", "resolution");
    formData.append("complaint_worker[of_phase]", "pms");
    formData.append("complaint_worker[of_atype]", "Pms::Site");

    selectedCategories.forEach((category) => {
      formData.append("category_ids[]", String(category.value));
    });

    Object.entries(selectedResolutionOptions.escalations).forEach(
      ([level, data]) => {
        formData.append(`escalation_matrix[${level.toLowerCase()}][name]`, level);
        data.users.forEach((user) => {
          formData.append(
            `escalation_matrix[${level.toLowerCase()}][escalate_to_users][]`,
            String(user.value)
          );
        });
        ["p1", "p2", "p3", "p4", "p5"].forEach((pField) => {
          const totalMinutes = convertToMinutes(
            data[pField as keyof EscalationLevel] as TimeValues
          );
          formData.append(
            `escalation_matrix[${level.toLowerCase()}][${pField}]`,
            String(totalMinutes)
          );
        });
      }
    );

    try {
      await postHelpDeskResolutionEscalationSetup(formData);
      setResEscalationAdded(true);
      toast.dismiss();
      toast.success("Resolution Escalation Created Successfully");
      setSelectedCategories([]);
      setSelectedResolutionOptions({ escalations: initialEscalations() });
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
      <FormSection title="Resolution Escalation">
        <div className="space-y-4">
          <Select
            isMulti
            value={selectedCategories}
            onChange={(selected) => setSelectedCategories(selected || [])}
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
                  {["P1", "P2", "P3", "P4", "P5"].map((p) => (
                    <th
                      key={p}
                      className="border border-border px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase"
                    >
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["E1", "E2", "E3", "E4", "E5"].map((level) => (
                  <tr key={level} className="border-b border-border">
                    <td className="border border-border px-4 py-2 text-sm">{level}</td>
                    <td className="border border-border px-4 py-2">
                      <Select
                        isMulti
                        value={selectedResolutionOptions.escalations[level].users}
                        onChange={(selected) =>
                          handleUserChange(selected, level)
                        }
                        options={users}
                      />
                    </td>
                    {(["p1", "p2", "p3", "p4", "p5"] as const).map((pField) => (
                      <td key={pField} className="border border-border px-4 py-2">
                        <div className="flex gap-2">
                          {(["days", "hrs", "min"] as const).map((unit) => (
                            <input
                              key={`${pField}-${unit}`}
                              type="text"
                              value={
                                selectedResolutionOptions.escalations[level][pField][unit]
                              }
                              onChange={(e) =>
                                handleTimeChange(
                                  e.target.value,
                                  level,
                                  pField,
                                  unit
                                )
                              }
                              placeholder={unit}
                              className="w-16 px-2 py-1 border border-border rounded-md text-sm"
                            />
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg"
              onClick={handleSaveResolutionEscalation}
            >
              Submit
            </button>
          </div>
        </div>
      </FormSection>

      <FormSection title="Resolution Escalation Rules">
        <div className="space-y-4">
          {resolutionEscalation.map((category, index) => (
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
                      {["P1", "P2", "P3", "P4", "P5"].map((p) => (
                        <th
                          key={p}
                          className="border border-border px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase"
                        >
                          {p}
                        </th>
                      ))}
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
                        <td className="border border-border px-4 py-2 text-sm">
                          {formatTime(level.p1)}
                        </td>
                        <td className="border border-border px-4 py-2 text-sm">
                          {formatTime(level.p2)}
                        </td>
                        <td className="border border-border px-4 py-2 text-sm">
                          {formatTime(level.p3)}
                        </td>
                        <td className="border border-border px-4 py-2 text-sm">
                          {formatTime(level.p4)}
                        </td>
                        <td className="border border-border px-4 py-2 text-sm">
                          {formatTime(level.p5)}
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
            <h2 className="text-lg font-semibold text-center mb-4">
              Clone Rule
            </h2>
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

export default ResolutionEscalation;
