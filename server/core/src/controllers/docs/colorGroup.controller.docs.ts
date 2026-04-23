/**
 * @swagger
 * /color-groups:
 *   get:
 *     summary: Get all color groups
 *     description: Returns a list of all available color groups.
 *     tags:
 *       - Color Groups
 *     responses:
 *       200:
 *         description: A list of color groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Warm
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