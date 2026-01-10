import React, { useState } from "react";
import { postAddress } from "../../../api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import FormGrid from "../../../components/ui/FormGrid";
import FormInput from "../../../components/ui/FormInput";
import FormSection from "../../../components/ui/FormSection";

function AddAddressesSetup() {
  const [formData, setFormData] = useState({
    title: "",
    buildingName: "",
    email: "",
    state: "",
    street: "",
    city: "",
    phone: "",
    pinCode: "",
  });
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const navigate = useNavigate();
  const handleAddressSubmit = async () => {
    const sendData = new FormData();
    sendData.append("address[address_title]", formData.title);
    sendData.append("address[building_name]", formData.buildingName);
    sendData.append("address[street_name]", formData.street);
    sendData.append("address[email_address]", formData.email);
    sendData.append("address[state]", formData.state);
    sendData.append("address[city]", formData.city);
    sendData.append("address[phone_number]", formData.phone);
    sendData.append("address[pin_code]", formData.pinCode);

    try {
        const addresResp = await postAddress(sendData);
        toast.success("Address Added Successfully");
        navigate("/admin/addresses-setup");
        console.log(addresResp);
    } catch (error) {
        console.log(error);
    }
  };

  return (
    <section className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Setup", path: "/setup" },
          { label: "Finance" },
          { label: "Addresses", path: "/admin/addresses-setup" },
          { label: "Add" },
        ]}
      />
      <FormSection title="Add Address Setup">
        <div className="space-y-6">
          <FormGrid columns={3}>
            <FormInput
              label="Address Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter Address Title"
            />
            <FormInput
              label="Building Name"
              name="buildingName"
              value={formData.buildingName}
              onChange={handleChange}
              placeholder="Enter Building Name"
            />
            <FormInput
              label="Phone Number"
              name="phone"
              type="number"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter Phone Number"
            />
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email Address"
            />
            <FormInput
              label="Street Name"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="Enter Street Name"
            />
            <FormInput
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter City"
            />
            <FormInput
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Enter State"
            />
            <FormInput
              label="Pin Code"
              name="pinCode"
              value={formData.pinCode}
              onChange={handleChange}
              placeholder="Enter Pin Code"
            />
          </FormGrid>

          <div className="flex justify-end">
            <Button onClick={handleAddressSubmit}>Submit</Button>
          </div>
        </div>
      </FormSection>
    </section>
  );
}

export default AddAddressesSetup;
