import { NextFunction, Response, Request } from 'express'
import { TenantService } from '../services/TenantService'
import { RequestCreateTenant } from '../types'
import { validationResult } from 'express-validator'
import createHttpError from 'http-errors'

export class TenantController {
    constructor(private tenantService: TenantService) {}

    async createTenant(
        req: RequestCreateTenant,
        res: Response,
        next: NextFunction,
    ) {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() })
        }
        const { name, address } = req.body
        try {
            const tenant = await this.tenantService.create({ name, address })
            res.status(201).json({ id: tenant.id })
        } catch (error) {
            next(error)
        }
    }

    async updateTenant(
        req: RequestCreateTenant,
        res: Response,
        next: NextFunction,
    ) {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() })
        }
        const { name, address } = req.body

        const tenantId = req.params.id

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param.'))
            return
        }

        try {
            await this.tenantService.update({ name, address }, Number(tenantId))
            res.status(201).json({ id: Number(tenantId) })
        } catch (error) {
            next(error)
        }
    }

    async getAllTenants(req: Request, res: Response, next: NextFunction) {
        try {
            //add query validation
            //TODO: add search functionality/filtering
            const page = req.query.page || 1
            const perPage = req.query.perPage || 200

            const tenants = await this.tenantService.getAllTenants(
                Number(page),
                Number(perPage),
            )
            return res.json(tenants)
        } catch (error) {
            next(error)
        }
    }

    async getTenant(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = req.params.id
            if (isNaN(Number(tenantId))) {
                next(createHttpError(400, 'Invalid url param.'))
                return
            }

            const tenant = await this.tenantService.getTenant(Number(tenantId))
            res.json(tenant)
        } catch (error) {
            next(error)
        }
    }

    async deleteTenant(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param.'))
            return
        }
        try {
            await this.tenantService.delete(Number(tenantId))
            res.status(201).json({ id: Number(tenantId) })
        } catch (error) {
            next(error)
        }
    }
}
