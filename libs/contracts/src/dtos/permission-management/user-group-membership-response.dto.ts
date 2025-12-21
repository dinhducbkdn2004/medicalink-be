export interface UserGroupMembershipResponseDto {
  id: string;
  userId: string;
  groupId: string;
  tenantId: string;
  group: {
    name: string;
    description?: string;
  };
  createdAt: Date;
}
