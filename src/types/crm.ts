export type Company = {
  id: string;
  name: string;
  status: 'lead' | 'prospect' | 'client' | 'partner' | 'inactive';
  city: string | null;
  website: string | null;
  created_at: string;
};

export type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  role: string | null;
  company_id: string | null;
  created_at: string;
};

export type Opportunity = {
  id: string;
  title: string;
  stage:
    | 'new_lead'
    | 'contacted'
    | 'qualified'
    | 'proposal'
    | 'negotiation'
    | 'won'
    | 'lost';
  value_estimate: number | null;
  expected_close_date: string | null;
  created_at: string;
};

export type Followup = {
  id: string;
  title: string;
  due_at: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
};
