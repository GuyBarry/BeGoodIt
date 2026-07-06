/**
 * @swagger
 * /fitting-room/{userId}/outfit:
 *   post:
 *     summary: Generate a virtual try-on outfit image
 *     description: >
 *       Fetches the user's stored body image and the specified clothing items,
 *       then calls the AI service to composite the garments onto the body.
 *       Returns a single photorealistic PNG image as a binary response.
 *
 *       If an outfit with this exact set of clothing items was already saved by the
 *       user, the previously generated image is returned instead of calling the AI
 *       service again. However, if the user's body photo has been replaced since that
 *       cached image was generated, it is considered stale: a new image is generated
 *       and the saved outfit is updated to point at it.
 *
 *       Pass `recreate: true` to bypass the cache entirely and always generate a new
 *       image, replacing any existing saved outfit's image regardless of staleness.
 *     tags:
 *       - Fitting Room
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
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clothingItemIds
 *             properties:
 *               clothingItemIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 minItems: 1
 *                 description: List of clothing item UUIDs to try on
 *                 example:
 *                   - a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *                   - b2c3d4e5-f6a7-8901-bcde-f12345678901
 *               recreate:
 *                 type: boolean
 *                 default: false
 *                 description: >
 *                   When true, ignore any cached outfit for this set of clothing items
 *                   and always regenerate the image, replacing the existing saved
 *                   outfit's image if one exists.
 *                 example: false
 *     responses:
 *       200:
 *         description: Generated outfit image (PNG)
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: >
 *           Missing or invalid userId, clothingItemIds is empty / not an array,
 *           or recreate is not a boolean
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: clothingItemIds must be a non-empty array
 *       404:
 *         description: No body image found for the user, or none of the provided clothing item IDs exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please upload a body photo before generating a look."
 *       500:
 *         description: Internal server error (including AI service failures)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Oops, something went wrong!
 */
