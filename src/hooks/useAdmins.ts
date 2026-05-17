import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminsApi, type CreateAdminPayload, type UpdateAdminPayload } from '../lib/api';

const KEY = ['admins'] as const;

export function useAdmins() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => adminsApi.list(),
    staleTime: 30_000,
  });
}

export function useCreateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAdminPayload) => adminsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdminPayload }) =>
      adminsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
