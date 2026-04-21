/**
 * @swagger
 * /garment-categories:
 *   get:
 *     summary: Get all garment categories
 *     description: Returns a list of all available garment categories.
 *     tags:
 *       - Garment Categories
 *     responses:
 *       200:
 *         description: A list of garment categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   categoryId:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Tops
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
