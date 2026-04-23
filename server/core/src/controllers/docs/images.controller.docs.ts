/**
 * @swagger
 * /image:
 *   post:
 *     summary: Upload an image
 *     description: Uploads an image file and stores it in the database.
 *     tags:
 *       - Images
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
 *                 description: The image file to upload (JPEG, PNG, or WebP, max 5MB)
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *                 mimeType:
 *                   type: string
 *                   example: image/png
 *                 originalName:
 *                   type: string
 *                   example: photo.png
 *                 size:
 *                   type: integer
 *                   example: 204800
 *                 createdAt:
 *                   type: string
 *                   format: date-time
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
 *                   example: "Unsupported file type: text/plain"
 *                 details:
 *                   type: object
 *                   properties:
 *                     allowedTypes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["image/jpeg", "image/png", "image/webp"]
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Oops, something went wrong!
 *
 * /image/{id}:
 *   get:
 *     summary: Get an image by ID
 *     description: Returns the raw image file with the appropriate Content-Type header.
 *     tags:
 *       - Images
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the image
 *     responses:
 *       200:
 *         description: Raw image binary
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/webp:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Image not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image with id '3fa85f64-...' not found"
 *       500:
 *         description: Internal server error
 */
