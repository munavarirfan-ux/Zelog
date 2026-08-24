import { AddEmployeePage } from "@/components/directory/AddEmployeePage";

export default function EditEmployeePage({ params }: { params: { employeeId: string } }) {
  return <AddEmployeePage employeeId={params.employeeId} />;
}
