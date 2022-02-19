import express from 'express';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import { read, write, add } from './jsonFileStorage.js';
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(cookieParser());

const handleIncomingRequestIndex = (_, response) => {
	read('data.json', (err, data) => {
		if (err) {
			console.log(err);
			return;
		}
		// console.log(data.sightings);
		response.render('', { sightings: data.sightings });
	});
};

const handleIncomingRequestPage = (request, response) => {
	read('data.json', (err, data) => {
		if (err) {
			console.log(err);
			return;
		}
		const { index } = request.params;
		const content = {
			index,
			sighting: data.sightings[index],
		};

		response.render('sighting', content);
	});
};

const handleIncomingForm = (request, response) => {
	add('data.json', 'sightings', request.body, (err) => {
		if (err) {
			response.status(500).send('DB write error.');
			return;
		}

		// What happens when we have many concurrent writes?
		response.render('sightings');
	});
};

// const handleIncomingEdit = (request, response) => {
// 	const { index } = request.params;

// 	add('data.json', `sightings${[index]}`, request.body, (err) => {
// 		if (err) {
// 			response.status(500).send('DB write error.');
// 			return;
// 		}
//     console.log(request.body)
// 		response.render('edit');
// 	});
// };
// const handleIncomingEdit = (request, response) => {

//   read('data.json', (data, err) => {
//     if (err) {
//       console.log('read error', err);
// 		}
//     const { index } = request.params;
//     data.sightings[index] = request.body;

// 		write('data.json', data, (newData) => {
// 			response.redirect('/');
// 		});
// 	});
// };

// const renderIncomingEdit = (request, response) => {
// 	add('data.json', 'sightings', request.body, (err) => {
// 		if (err) {
// 			response.status(500).send('DB write error.');
// 			return;
// 		}
// 		const { index } = request.params;
// 		const sighting = data.sightings[index];

// 		response.render('edit', {index, sighting});
// 	});
// };
app.get('/sighting/:index/edit', (req, res) => {
	read('data.json', (err, data) => { //why cant I write read('data.json', (data, err) => same issue on line 108
		if (err) {
			console.log('read error', err);
		}

		const { index } = req.params;

		const sighting = data.sightings[index];

		res.render('edit', { index, sighting });
	});
});

app.put('/sighting/:index/edit', (req, res) => {
	const { index } = req.params;

	read('data.json', (err, data) => {
		if (err) {
			console.log('read error', err);
		}

		data.sightings[index] = req.body;

		write('data.json', data, (newData) => {
			console.log('file changed');
			res.redirect('/');
		});
	});
});
// Gerald Code
// app.get('/sighting/:index/edit', (request, response) => {
// 	read('data.json', (err, jsonData) => {
// 	  const { index } = request.params;

// 	  if (jsonData.sightings == null || index >= jsonData.sightings.length || err) {
// 		response.status(404).render('error');
// 	  }

// 	  const sighting = jsonData.sightings[index];
// 	  // Pass the recipe index to the edit form for the PUT request URL.
// 	  sighting.index = index;
// 	  const ejsData = { sighting };
// 	  response.render('edit', ejsData);
// 	});
//   });

// app.delete('/sighting/:index/delete', (req, res) => {
// 	read('data.json', (data) => {
// 		const { index } = req.params;
// 		const sightingsArr = data.sightings;
// 		sightingsArr.splice(index, 1);

// 		write('data.json', data, (newData) => {
// 			res.redirect('/');
// 		});
// 	});
// });

// app.get('/shapes', (_, response) => {
//   read('data.json', (err, data) => {
//     const uniqueshapes = new Set();

//     data.sightings.forEach((sighting) => {
//       if (sighting.shape !== undefined) {
//         uniqueshapes.add(sighting.shape);
//       }
//     });

//     response.render('shapes', { shapes: [...uniqueshapes] });
//   });
// });

app.get('/', handleIncomingRequestIndex);
app.get('/sighting', handleIncomingForm);
app.post('/sighting', handleIncomingForm);
app.get('/sightings/:index', handleIncomingRequestPage);
// app.get('/sighting/:index/edit', renderIncomingEdit);
// app.post('/sighting/:index/edit', handleIncomingEdit);

app.listen(3004);
