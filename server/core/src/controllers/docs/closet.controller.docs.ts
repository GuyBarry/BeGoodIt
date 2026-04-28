/**
 * @swagger
 * /closet/{userId}:
 *   get:
 *     summary: Get all closet items for a user
 *     description: Returns all clothing items belonging to the given user, with their associated color group, category, and season.
 *     tags:
 *       - Closet
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the user
 *         example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *     responses:
 *       200:
 *         description: List of clothing items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClothingItemDto'
 *       500:
 *         description: Internal server error
 *
 * /closet/{userId}/items:
 *   post:
 *     summary: Add a clothing item to a user's closet
 *     description: >
 *       Uploads a clothing image, removes its background, saves it to the image
 *       store, and creates a new clothing item record linked to the given user.
 *     tags:
 *       - Closet
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the user
 *         example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The clothing image file to upload (JPEG, PNG, or WebP, max 5MB)
 *     responses:
 *       201:
 *         description: Clothing item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClothingItemDto'
 *       400:
 *         description: No file provided or file is corrupted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No file provided
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
 *
 * components:
 *   schemas:
 *     ClothingItemDto:
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
 *         imageUrl:
 *           type: string
 *           example: /images/3fa85f64-5717-4562-b3fc-2c963f66afa6
 *         style:
 *           type: string
 *           nullable: true
 *           example: casual
 *         colorGroup:
 *           nullable: true
 *           allOf:
 *             - $ref: '#/components/schemas/NamedRefDto'
 *         category:
 *           nullable: true
 *           allOf:
 *             - $ref: '#/components/schemas/NamedRefDto'
 *         season:
 *           nullable: true
 *           allOf:
 *             - $ref: '#/components/schemas/NamedRefDto'
 *         createdAt:
 *           type: string
 *           format: date-time
 *     NamedRefDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Blue
 */
