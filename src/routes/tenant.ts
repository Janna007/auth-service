import express, { NextFunction, Request, Response } from 'express'
import { TenantController } from '../controllers/TenantController'
import { TenantService } from '../services/TenantService'
import { AppDataSource } from '../config/data-source'
import { Tenant } from '../entity/Tenant'
import authenticate from '../middlewares/authenticate'
import canAccess from '../middlewares/canAccess'
import { roles } from '../constants'
import tenantCreateValidator from '../validators/tenant-create-validator'

const router = express.Router()

const tenantRepository = AppDataSource.getRepository(Tenant)
const tenantService = new TenantService(tenantRepository)
const tenantController = new TenantController(tenantService)

router.post(
    '/',
    authenticate,
    canAccess([roles.ADMIN]),
    tenantCreateValidator,
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.createTenant(req, res, next),
)

router.patch(
    '/update/:id',
    authenticate,
    canAccess([roles.ADMIN]),
    tenantCreateValidator,
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.updateTenant(req, res, next),
)

router.get('/all-tenants', (req: Request, res: Response, next: NextFunction) =>
    tenantController.getAllTenants(req, res, next),
)

router.get(
    '/:id',
    authenticate,
    canAccess([roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.getTenant(req, res, next),
)

router.delete(
    '/delete/:id',
    authenticate,
    canAccess([roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.deleteTenant(req, res, next),
)

export default router
