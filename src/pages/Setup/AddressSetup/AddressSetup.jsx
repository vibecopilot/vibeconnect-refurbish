import React, { useEffect, useMemo, useState } from "react";
import { BiEdit } from "react-icons/bi";
import { IoAddCircleOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { getAllAddress } from "../../../api";
import Button from "../../../components/ui/Button";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import DataTable from "../../../components/ui/DataTable";
import FormGrid from "../../../components/ui/FormGrid";
import FormInput from "../../../components/ui/FormInput";
function AddressesSetup() {
  const [addresses, setAddresses] = useState([]);
  const [searchText, setSearchText] = useState("");

  const columns = useMemo(
    () => [
      {
        key: "actions",
        header: "Actions",
        render: (_val, row) => (
          <div className="flex items-center gap-4">
            <Link to={`/admin/edit-addresses-setup/${row.id}`}>
              <BiEdit size={15} />
            </Link>
          </div>
        ),
      },
      {
        key: "address_title",
        header: "Title",
        sortable: true,
        render: (val) => val || "-",
      },
      {
        key: "email_address",
        header: "Email",
        sortable: true,
        render: (val) => val || "-",
      },
      {
        key: "phone_number",
        header: "Phone Number",
        sortable: true,
        render: (val) => val || "-",
      },
      {
        key: "building_name",
        header: "Building Name",
        sortable: true,
        render: (val) => val || "-",
      },
      {
        key: "street_name",
        header: "Street Name",
        sortable: true,
        render: (val) => val || "-",
      },
      { key: "city", header: "City", sortable: true, render: (val) => val || "-" },
      { key: "state", header: "State", sortable: true, render: (val) => val || "-" },
      { key: "pin_code", header: "Pin Code", sortable: true, render: (val) => val || "-" },
    ],
    []
  );

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const addressResp = await getAllAddress();
        setAddresses(addressResp.data || []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchAddress();
  }, []);

  const filteredAddress = useMemo(() => {
    if (!searchText) return addresses;
    const needle = searchText.toLowerCase();
    return addresses.filter((item) => {
      return (
        item.address_title?.toLowerCase().includes(needle) ||
        item.email_address?.toLowerCase().includes(needle) ||
        item.phone_number?.toLowerCase().includes(needle) ||
        item.building_name?.toLowerCase().includes(needle) ||
        item.street_name?.toLowerCase().includes(needle) ||
        item.city?.toLowerCase().includes(needle) ||
        item.state?.toLowerCase().includes(needle) ||
        String(item.pin_code || "").includes(needle)
      );
    });
  }, [addresses, searchText]);

  return (
    <section className="space-y-4">
      <Breadcrumb
        items={[
          { label: "Setup", path: "/setup" },
          { label: "Finance" },
          { label: "Addresses" },
        ]}
      />
      <FormGrid columns={2}>
        <FormInput
          label="Search"
          name="search"
          placeholder="Search addresses"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="flex items-end justify-end">
          <Link to="/admin/add-addresses-setup">
            <Button leftIcon={<IoAddCircleOutline className="w-4 h-4" />}>
              Add
            </Button>
          </Link>
        </div>
      </FormGrid>

      <DataTable columns={columns} data={filteredAddress} />
    </section>
  );
}

export default AddressesSetup;
