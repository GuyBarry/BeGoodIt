/**
 * @swagger
 * /outfits/{userId}:
 *   get:
 *     summary: Get all saved outfits for a user
 *     description: Returns all outfits belonging to the given user, including their clothing items.
 *     tags:
 *       - Outfits
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
 *         description: List of outfits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OutfitDto'
 *       400:
 *         description: userId is required
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Save a new outfit for a user
 *     description: Creates an outfit linking the given clothing items to a generated outfit image.
 *     tags:
 *       - Outfits
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
 *               - imageId
 *               - clothingItemIds
 *             properties:
 *               imageId:
 *                 type: string
 *                 format: uuid
 *                 description: The UUID of the generated outfit image
 *                 example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *               clothingItemIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: The UUIDs of the clothing items that make up the outfit
 *                 example: ['3fa85f64-5717-4562-b3fc-2c963f66afa6']
 *     responses:
 *       201:
 *         description: Outfit created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OutfitDto'
 *       400:
 *         description: Missing or invalid imageId / clothingItemIds
 *       500:
 *         description: Internal server error
 *
 * /outfits/{userId}/{outfitId}:
 *   delete:
 *     summary: Delete a saved outfit
 *     description: Deletes the outfit with the given ID, only if it belongs to the specified user.
 *     tags:
 *       - Outfits
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the user
 *         example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *       - in: path
 *         name: outfitId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the outfit to remove
 *         example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *     responses:
 *       204:
 *         description: Outfit removed successfully
 *       400:
 *         description: userId or outfitId is required
 *       404:
 *         description: Outfit not found or does not belong to the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Outfit not found
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     OutfitDto:
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
 *         name:
 *           type: string
 *           nullable: true
 *           example: Weekend brunch
 *         isFavorite:
 *           type: boolean
 *           example: false
 *         imageId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *         createdAt:
 *           type: string
 *           format: date-time
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ClothingItemDto'
 */
