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

    async getAllTenants() {
        try {
            const tenants = await this.tenantRepository.find()
            return tenants
        } catch {
            const error = createHttpError(
                500,
                'Error while fetching tenant data',
            )
            throw error
        }
    }
}
