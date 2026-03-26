import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AdminRole } from '@prisma/client';
import { StaffService } from './staff.service';
import { StaffRepository } from './staff.repository';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockStaff = {
  id: BigInt(1),
  email: 'staff@mspi.tn',
  name: 'Ahmed Ben Ali',
  role: AdminRole.VIEWER,
  active: true,
  lastLoginAt: null,
  createdAt: new Date(),
};

const mockCreateStaffDto = {
  name: 'Ahmed Ben Ali',
  email: 'staff@mspi.tn',
  password: 'Str0ngPass!',
  role: AdminRole.VIEWER,
};

// ---------------------------------------------------------------------------
// Mock factory
// ---------------------------------------------------------------------------

const buildStaffRepoMock = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  updateActive: jest.fn(),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('StaffService', () => {
  let service: StaffService;
  let repo: ReturnType<typeof buildStaffRepoMock>;

  beforeEach(async () => {
    repo = buildStaffRepoMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [StaffService, { provide: StaffRepository, useValue: repo }],
    }).compile();

    service = module.get<StaffService>(StaffService);
  });

  // ─── list ────────────────────────────────────────────

  describe('list', () => {
    it('calls repo.findAll and returns wrapped data', async () => {
      repo.findAll.mockResolvedValue([mockStaff]);

      const result = await service.list();

      expect(repo.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: [mockStaff] });
    });
  });

  // ─── create ──────────────────────────────────────────

  describe('create', () => {
    it('throws ConflictException when email already exists', async () => {
      repo.findByEmail.mockResolvedValue(mockStaff);

      await expect(service.create(mockCreateStaffDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('calls repo.create and returns wrapped data when email is free', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockStaff);

      const result = await service.create(mockCreateStaffDto);

      expect(repo.findByEmail).toHaveBeenCalledWith(mockCreateStaffDto.email);
      expect(repo.create).toHaveBeenCalledWith({
        name: mockCreateStaffDto.name,
        email: mockCreateStaffDto.email,
        password: mockCreateStaffDto.password,
        role: mockCreateStaffDto.role,
      });
      expect(result).toEqual({ data: mockStaff });
    });
  });

  // ─── deactivate ──────────────────────────────────────

  describe('deactivate', () => {
    it('throws NotFoundException when staff member not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.deactivate(BigInt(99))).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.updateActive).not.toHaveBeenCalled();
    });

    it('calls repo.updateActive(id, false) when staff exists', async () => {
      repo.findById.mockResolvedValue(mockStaff);
      const deactivated = { ...mockStaff, active: false };
      repo.updateActive.mockResolvedValue(deactivated);

      const result = await service.deactivate(mockStaff.id);

      expect(repo.updateActive).toHaveBeenCalledWith(mockStaff.id, false);
      expect(result).toEqual({ data: deactivated });
    });
  });

  // ─── reactivate ──────────────────────────────────────

  describe('reactivate', () => {
    it('throws NotFoundException when staff member not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.reactivate(BigInt(99))).rejects.toThrow(
        NotFoundException,
      );
    });

    it('calls repo.updateActive(id, true) when staff exists', async () => {
      const inactiveStaff = { ...mockStaff, active: false };
      repo.findById.mockResolvedValue(inactiveStaff);
      repo.updateActive.mockResolvedValue(mockStaff);

      const result = await service.reactivate(mockStaff.id);

      expect(repo.updateActive).toHaveBeenCalledWith(mockStaff.id, true);
      expect(result).toEqual({ data: mockStaff });
    });
  });
});
