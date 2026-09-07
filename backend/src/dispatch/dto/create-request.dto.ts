export class CreateRequestDto {
  title: string;
  description: string;
  category: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  requesterId?: string;
  requesterName?: string;
  requesterEmail?: string;
  requesterDept?: string;
  requesterPhone?: string;
  locationBuilding: string;
  locationFloor: string;
  locationRoom: string;
}
