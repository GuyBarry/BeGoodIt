/**
 * @swagger
 * /images/{id}:
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
