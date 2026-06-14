import type {
  AdminCouponDto,
  AdminCouponStatus,
  CreateAdminCouponCommand,
  UpdateAdminCouponCommand,
} from "../AdminCouponDtos";

export type AdminCouponRepository = {
  changeStatus(input: {
    actorId: string | null;
    couponId: string;
    now: Date;
    status: AdminCouponStatus;
  }): Promise<AdminCouponDto>;
  create(input: CreateAdminCouponCommand): Promise<AdminCouponDto>;
  findByCodeNormalized(codeNormalized: string): Promise<AdminCouponDto | null>;
  findById(couponId: string): Promise<AdminCouponDto | null>;
  list(): Promise<AdminCouponDto[]>;
  update(input: UpdateAdminCouponCommand): Promise<AdminCouponDto>;
};
