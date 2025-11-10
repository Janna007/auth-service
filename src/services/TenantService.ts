import createHttpError from 'http-errors'
import { Tenant } from '../entity/Tenant'
import { Repository } from 'typeorm'
import { createTenantData } from '../types'

export class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}
    async create({ name, address }: createTenantData) {
        try {
            const tenant = await this.tenantRepository.save({ name, address })
            return tenant
        } catch {
            const error = createHttpError(500, 'Error while saving tenant data')
            throw error
        }
    }

    async update({ name, address }: createTenantData, tenantId: number) {
        try {
            await this.tenantRepository.update(tenantId, { name, address })
        } catch {
            const error = createHttpError(
                500,
                'Error while updating tenant data',
            )
            throw error
        }
    }

    async getAllTenants() {
        try {
            const tenants = await this.tenantRepository.findAndCount()
            return tenants
        } catch {
            const error = createHttpError(
                500,
                'Error while fetching tenant data',
            )
            throw error
        }
    }

    async getTenant(tenantId: number) {
        try {
            const tenant = await this.tenantRepository.findBy({ id: tenantId })
            return tenant
        } catch {
            const error = createHttpError(
                500,
                'Error while fetching tenant data',
            )
            throw error
        }
    }

    async delete(tenantId: number) {
        try {
            await this.tenantRepository.delete(tenantId)
        } catch {
            const error = createHttpError(
                500,
                'Error while deleting tenant data',
            )
            throw error
        }
    }
}
