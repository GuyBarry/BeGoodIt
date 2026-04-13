/**
 * @swagger
 * /image:
 *   post:
 *     summary: Upload an image
 *     description: Uploads an image file, processes it, and stores it in Firebase Storage.
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
 *                 url:
 *                   type: string
 *                   example: https://storage.googleapis.com/bucket/images/abc-123.jpg
 *                 fileName:
 *                   type: string
 *                   example: images/abc-123.jpg
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
 */
export {};
