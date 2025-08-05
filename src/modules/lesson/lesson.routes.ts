
import { Router } from 'express';
import { create, getById, getByPlaylistId, update, remove } from './lesson.controller';

const lessonRoutes = Router();

lessonRoutes.post('/', create);
lessonRoutes.get('/:id', getById);
lessonRoutes.get('/playlist/:playlistId', getByPlaylistId);
lessonRoutes.put('/:id', update);
lessonRoutes.delete('/:id', remove);

export { lessonRoutes };
