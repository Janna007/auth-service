import express from 'express'
import { TenantController } from '../controllers/TenantController'
import { TenantService } from '../services/TenantService'
import { AppDataSource } from '../config/data-source'
import { Tenant } from '../entity/Tenant'

const router = express.Router()

const tenantRepository = AppDataSource.getRepository(Tenant)
const tenantService = new TenantService(tenantRepository)
const tenantController = new TenantController(tenantService)

router.post('/', (req, res, next) =>
    tenantController.createTenant(req, res, next),
)

export default router
