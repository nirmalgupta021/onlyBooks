export interface Complaint {
  id: string;
  memberId: string;
  memberName: string;
  category: string;
  title: string;
  description: string;
  contactPreference: 'Phone' | 'Email';
  submissionDate: Date;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedTo?: string;
  priority: 'Low' | 'Medium' | 'High';
  responses: ComplaintResponse[];
  resolutionDate?: Date;
  resolutionNotes?: string;
}

export interface ComplaintResponse {
  id: string;
  respondedBy: string;
  responseText: string;
  responseDate: Date;
  isFromAdmin: boolean;
}

export interface ComplaintUpdate {
  complaintId: string;
  status: string;
  assignedTo?: string;
  priority?: string;
  responseText?: string;
}
