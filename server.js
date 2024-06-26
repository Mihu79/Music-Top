const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json'); 
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 3000;

server.use(middlewares);
server.use(jsonServer.bodyParser); 
server.patch('/songs/:id/increase-votes', (req, res) => {
    const { id } = req.params;
    const { votes } = req.body;

    
    let songs = router.db.get('songs');
    let song = songs.find({ id: parseInt(id) }).value();

    if (!song) {
        return res.status(404).json({ error: 'Song not found' });
    }

   
    song.votes = parseInt(song.votes) + 1;

    
    router.db.get('songs')
        .find({ id: parseInt(id) })
        .assign({ votes: song.votes })
        .write();

    return res.status(200).json(song);
});
server.use(router);

server.listen(port, () => {
    console.log(`JSON Server is running on port ${port}`);
});
