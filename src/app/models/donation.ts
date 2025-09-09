export interface Donation {
  id: string;
  memberId: string;
  memberName: string;
  bookTitle: string;
  author: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  quantity: number;
  description?: string;
  imageUrl?: string;
  submissionDate: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminComments?: string;
  reviewedBy?: string;
  reviewDate?: Date;
}

export interface DonationDecision {
  donationId: string;
  decision: 'Approved' | 'Rejected';
  comments: string;
}
