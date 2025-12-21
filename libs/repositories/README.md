# Repository Pattern Implementation

This library provides a base repository pattern implementation for the Medicalink microservices architecture.

## Overview

The repository pattern provides a consistent interface for data access operations across all microservices. It includes:

- **IBaseRepository**: Generic interface defining common CRUD operations
- **BaseRepository**: Abstract base class implementing the interface with Prisma integration
- **Repository Module**: NestJS module for dependency injection

## Features

### Base Repository Interface (`IBaseRepository`)

Provides standard CRUD operations:
- `create(data)` - Create new entity
- `findById(id)` - Find entity by ID
- `findAll(options)` - Find all entities with optional filtering
- `findMany(options)` - Find entities with pagination
- `findFirst(where)` - Find first entity matching criteria
- `update(id, data)` - Update entity by ID
- `delete(id)` - Delete entity by ID
- `deleteMany(where)` - Delete multiple entities
- `count(where)` - Count entities
- `exists(where)` - Check if entity exists
- `updateMany(where, data)` - Update multiple entities
- `upsert(where, create, update)` - Create or update entity

### Base Repository Class (`BaseRepository`)

Abstract class that implements `IBaseRepository` with Prisma integration:
- Provides default implementations for all CRUD operations
- Can be extended with custom methods specific to each entity
- Uses generic types for type safety

## Usage

### 1. Install Dependencies

Each microservice should have `@prisma/client` installed:

```bash
npm install @prisma/client
```

### 2. Create Entity Repository

Create a repository for your entity by extending `BaseRepository`:

```typescript
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@app/repositories';
import { PrismaService } from '../prisma/prisma.service';

export interface CreatePatientDto {
  email: string;
  firstName: string;
  lastName: string;
  // ... other fields
}

export interface UpdatePatientDto extends Partial<CreatePatientDto> {
  isActive?: boolean;
}

export interface PatientFilterOptions {
  email?: string;
  firstName?: string;
  isActive?: boolean;
  // ... other filter options
}

@Injectable()
export class PatientRepository extends BaseRepository<
  Patient,
  CreatePatientDto,
  UpdatePatientDto,
  PatientFilterOptions
> {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService.patient);
  }

  // Add custom methods specific to Patient entity
  async findByEmail(email: string): Promise<Patient> {
    return await this.model.findUnique({
      where: { email },
    });
  }

  async findActivePatients(): Promise<Patient[]> {
    return await this.model.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

### 3. Use Repository in Service

Inject and use the repository in your service:

```typescript
import { Injectable } from '@nestjs/common';
import { PatientRepository } from './patient.repository';

@Injectable()
export class PatientsService {
  constructor(private readonly patientRepository: PatientRepository) {}

  async createPatient(createPatientDto: CreatePatientDto) {
    return await this.patientRepository.create(createPatientDto);
  }

  async findPatient(id: string) {
    return await this.patientRepository.findById(id);
  }

  async findPatientByEmail(email: string) {
    return await this.patientRepository.findByEmail(email);
  }

  async findActivePatients() {
    return await this.patientRepository.findActivePatients();
  }

  async findPatientsWithPagination(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return await this.patientRepository.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

### 4. Register Repository in Module

Add the repository to your module providers:

```typescript
import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { PatientRepository } from './patient.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PatientsController],
  providers: [PatientsService, PatientRepository, PrismaService],
  exports: [PatientRepository],
})
export class PatientsModule {}
```

## Benefits

1. **Consistency**: All repositories follow the same interface
2. **Type Safety**: Full TypeScript support with generics
3. **Reusability**: Base implementation reduces boilerplate code
4. **Extensibility**: Easy to add custom methods for specific entities
5. **Testing**: Easy to mock repositories for unit testing
6. **Separation of Concerns**: Clear separation between data access and business logic

## Best Practices

1. **Keep repositories focused**: Each repository should handle one entity
2. **Use specific DTOs**: Create separate DTOs for create, update, and filter operations
3. **Add custom methods**: Extend base functionality with entity-specific methods
4. **Handle errors**: Add proper error handling in custom methods
5. **Use transactions**: For complex operations, use Prisma transactions
6. **Add validation**: Validate input data before database operations

## Example with Transactions

```typescript
async createPatientWithAppointment(
  patientData: CreatePatientDto,
  appointmentData: CreateAppointmentDto,
) {
  return await this.prismaService.$transaction(async (prisma) => {
    const patient = await prisma.patient.create({ data: patientData });
    const appointment = await prisma.appointment.create({
      data: { ...appointmentData, patientId: patient.id },
    });
    return { patient, appointment };
  });
}
```

## Testing

Example unit test with mocked repository:

```typescript
describe('PatientsService', () => {
  let service: PatientsService;
  let repository: PatientRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: PatientRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    repository = module.get<PatientRepository>(PatientRepository);
  });

  it('should create a patient', async () => {
    const createPatientDto = { email: 'test@example.com', firstName: 'John', lastName: 'Doe' };
    const expectedPatient = { id: '1', ...createPatientDto };

    jest.spyOn(repository, 'create').mockResolvedValue(expectedPatient);

    const result = await service.createPatient(createPatientDto);

    expect(repository.create).toHaveBeenCalledWith(createPatientDto);
    expect(result).toEqual(expectedPatient);
  });
});
```