import { EmployeeProfile } from "@/components/directory/EmployeeProfile";

export default function EmployeeProfilePage({ params }: { params: { employeeId: string } }) {
  return <EmployeeProfile employeeId={params.employeeId} />;
}
