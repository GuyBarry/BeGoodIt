/**
 * @swagger
 * /body/image:
 *   post:
 *     summary: Upload a body image for a user
 *     description: >
 *       Uploads a body image file, saves it to the image store, and creates a
 *       body mapping record for the given user with default values for height,
 *       weight, and body type.
 *     tags:
 *       - Body
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - userId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The body image file to upload (JPEG, PNG, or WebP, max 5MB)
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: The UUID of the user this body mapping belongs to
 *                 example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *     responses:
 *       201:
 *         description: Body mapping created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BodyMappingDto'
 *       400:
 *         description: Missing userId, no file provided, or file is corrupted
 *       413:
 *         description: File exceeds maximum allowed size (5MB)
 *       415:
 *         description: Unsupported file type
 *       500:
 *         description: Internal server error
 *
 * /body/data:
 *   post:
 *     summary: Save body measurements for a user
 *     description: >
 *       Updates height, weight, and/or body type on an existing body mapping
 *       record. The user must have uploaded a body image first (POST /body/image).
 *       Only fields that are provided will be updated.
 *     tags:
 *       - Body
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *               heightCm:
 *                 type: number
 *                 nullable: true
 *                 example: 175.5
 *               weightKg:
 *                 type: number
 *                 nullable: true
 *                 example: 70.0
 *               bodyType:
 *                 type: string
 *                 nullable: true
 *                 example: athletic
 *     responses:
 *       200:
 *         description: Body data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BodyMappingDto'
 *       400:
 *         description: Missing userId
 *       404:
 *         description: No body record found for this user — upload a body image first
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     BodyMappingDto:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *         userId:
 *           type: string
 *           format: uuid
 *           example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *         imageId:
 *           type: string
 *           format: uuid
 *           example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *         picture:
 *           type: string
 *           nullable: true
 *           example: null
 *         heightCm:
 *           type: number
 *           nullable: true
 *           example: 175.5
 *         weightKg:
 *           type: number
 *           nullable: true
 *           example: 70.0
 *         bodyType:
 *           type: string
 *           nullable: true
 *           example: athletic
 *         createdAt:
 *           type: string
 *           format: date-time
 */

 *     description: >
 *       Uploads a body image file, saves it to the image store, and creates a
 *       body mapping record for the given user with default values for height,
 *       weight, and body type.
 *     tags:
 *       - Body
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - userId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The body image file to upload (JPEG, PNG, or WebP, max 5MB)
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: The UUID of the user this body mapping belongs to
 *                 example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *     responses:
 *       201:
 *         description: Body mapping created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                   example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *                 imageId:
 *                   type: string
 *                   format: uuid
 *                   example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *                 bodyPictures:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 *                 heightCm:
 *                   type: number
 *                   nullable: true
 *                   example: null
 *                 weightKg:
 *                   type: number
 *                   nullable: true
 *                   example: null
 *                 bodyType:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Missing userId, no file provided, or file is corrupted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: userId is required
 *                 details:
 *                   description: Optional additional context
 *       413:
 *         description: File exceeds maximum allowed size (5MB)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File too large
 *                 details:
 *                   type: object
 *                   properties:
 *                     maxSize:
 *                       type: string
 *                       example: 5MB
 *       415:
 *         description: Unsupported file type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Unsupported file type: image/gif'
 *                 details:
 *                   type: object
 *                   properties:
 *                     allowedTypes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [image/jpeg, image/png, image/webp]
 *       500:
 *         description: Internal server error
 */
