import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoMdAdd } from 'react-icons/io';
import { BiEdit } from 'react-icons/bi';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import FormGrid from '../../../components/ui/FormGrid';
import FormInput from '../../../components/ui/FormInput';
import FormSection from '../../../components/ui/FormSection';
function InvoiceApprovalSetup() {
    const [searchText, setSearchText] = useState('');
    const columns = useMemo(() => [
        {
          key: "actions",
          header: "Actions",
          render: (_val, row) => (
            <div className="flex items-center gap-4">
              <Link to={`/admin/edit-invoice-approval-setup/${row.id}`}>
                <BiEdit size={15} />
              </Link>
            </div>
          ),
        },
        { key: "Id", header: "Id", sortable: true, render: (val) => val ?? "-" },
        { key: "function", header: "Function", sortable: true, render: (val) => val || "-" },
        { key: "createdOn", header: "Created On", sortable: true, render: (val) => val || "-" },
        { key: "createdBy", header: "Created By", sortable: true, render: (val) => val || "-" },
    ], []);

    const data = [
        {
          id: 1,
          Id: "	1",
          function: "Purchase Order",
          createdOn: "24/12/2021",
          createdBy: "Navin Lead Admin",
        },
    ];

    const filteredData = data.filter((row) => {
      if (!searchText) return true;
      const needle = searchText.toLowerCase();
      return (
        row.function?.toLowerCase().includes(needle) ||
        row.createdBy?.toLowerCase().includes(needle) ||
        String(row.Id).includes(needle)
      );
    });
  return (
    <section className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Setup", path: "/setup" },
          { label: "Finance" },
          { label: "Invoice Approval" },
        ]}
      />
      <FormSection title="Invoice Approval">
        <div className="space-y-4">
          <FormGrid columns={2}>
            <FormInput
              label="Search"
              name="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by function or creator"
            />
            <div className="flex items-end justify-end">
              <Link to={`/admin/add-invoice-approval-setup`}>
                <Button leftIcon={<IoMdAdd className="w-4 h-4" />}>
                  Add
                </Button>
              </Link>
            </div>
          </FormGrid>
          <DataTable columns={columns} data={filteredData} />
        </div>
      </FormSection>
    </section>
  )
}

export default InvoiceApprovalSetup
