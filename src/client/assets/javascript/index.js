// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
  const store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
	tracksData: undefined,
	is_started: false,
  };
  
  // We need our javascript to wait until the DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
	onPageLoad();
	setupClickHandlers();
  });
  
  async function onPageLoad() {
	try {
	  await getTracks().then(tracks => {
		store.tracksData = tracks;
		const html = renderTrackCards(tracks);
		renderAt('#tracks', html);
	  });
  
	  await getRacers().then(racers => {
		const html = renderRacerCars(racers);
		renderAt('#racers', html);
	  });
	} catch (error) {
	  console.log('Problem getting tracks and/or racers ::', error.message);
	  console.error(error);
	}
  }
  
  function setupClickHandlers() {
	document.addEventListener(
	  'click',
	  function(event) {
		const { target } = event;
  
		// Race track form field
		let el = Array.from(event.path).find(el => {
		  return el && el.matches && el.matches('.card.track');
		});
		if (el) {
		  handleSelectTrack(el);
		}
  
		el = Array.from(event.path).find(el => {
		  return el && el.matches && el.matches('.card.podracer');
		});
		// Podracer form field
		if (el) {
		  handleSelectPodRacer(el);
		}
  
		// Submit create race form
		if (target.matches('#submit-create-race')) {
		  event.preventDefault();
		  // start race
		  if (store.track_id === undefined || store.player_id === undefined) {
			alert('Select racer and track.');
		  } else {
			handleCreateRace();
		  }
		}
  
		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
		  handleAccelerate(target);
		}
	  },
	  false,
	);
  }
  
  async function delay(ms) {
	try {
	  return await new Promise(resolve => setTimeout(resolve, ms));
	} catch (error) {
	  console.log("an error shouldn't be possible here");
	  console.log(error);
	}
  }
  // ^ PROVIDED CODE ^ DO NOT REMOVE
  
  // This async function controls the flow of the race, add the logic and error handling
  async function handleCreateRace() {
	// render starting UI
	renderAt(
	  '#race',
	  renderRaceStartView(
		store.tracksData.find(
		  trackData => Number(trackData.id) === store.track_id,
		),
	  ),
	);
  
	// DONE - Get player_id and track_id from the store
	const player_id = store.player_id;
	const track_id = store.track_id;
	try {
	  // invoke the API call to create the race, then save the result
	  const race_id = await createRace(player_id, track_id)
		.then(raceData => Number(raceData.ID) - 1)
		.catch(() => console.error(`This shouldn't happened`));
  
	  // DONE - update the store with the race id
	  store.race_id = race_id;
  
	  // The race has been created, now start the countdown
	  // DONE - call the async function runCountdown
	  await runCountdown();
	  // DONE - call the async function startRace
	  await startRace(race_id);
	  // DONE - call the async function runRace
	  await runRace(race_id);

	} catch (err) {
	  console.error('handleCreateRace ', err);
	}
  }
  
  // async not needed
  function runRace(raceID) {
	return new Promise(resolve => {
	  store.is_started = true;
	  // DONE - use Javascript's built in setInterval method to get race info every 500ms
	  const raceInterval = setInterval(async function() {
		const raceData = await getRace(store.race_id);
		/* DONE - if the race info status property is "in-progress", update the leaderboard */
		if (raceData.status === 'in-progress') {
		  renderAt('#leaderBoard', raceProgress(raceData.positions));
		}
		/*  DONE - if the race info status property is "finished" */
		if (raceData.status === 'finished') {
		  store.is_started = false;
		  clearInterval(raceInterval);
		  renderAt('#race', resultsView(raceData.positions));
		  resolve(raceData);
		}
	  }, 500);
	}).catch(err => {
	  console.error('runRace', err);
	});
	// remember to add error handling for the Promise
  }
  
  async function runCountdown() {
	try {
	  // wait for the DOM to load
	  await delay(1000);
	  let timer = 3;
  
	  return new Promise(resolve => {
		// DONE - use Javascript's built in setInterval method to count down once per second
		const intervalId = setInterval(() => {
		  // run this DOM manipulation to decrement the countdown for the user
		  document.getElementById('big-numbers').innerHTML = --timer;
		  // DONE - if the countdown is done, clear the interval, resolve the promise, and return
		  if (timer === 0) {
			clearInterval(intervalId);
			resolve();
			return;
		  }
		}, 1000);
	  });
	} catch (error) {
	  console.log(error);
	}
  }
  
  function handleSelectPodRacer(target) {
	console.log('Selected Pod', target.id);
  
	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected');
	if (selected) {
	  selected.classList.remove('selected');
	}
  
	// add class selected to current target
	target.classList.add('selected');
  
	// DONE - save the selected racer to the store
	store.player_id = Number(target.getAttribute('id'));
  }
  
  function handleSelectTrack(target) {
	console.log('Selected Track', target.id);
  
	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected');
	if (selected) {
	  selected.classList.remove('selected');
	}
  
	// add class selected to current target
	target.classList.add('selected');
  
	// DONE - save the selected track id to the store
	store.track_id = Number(target.getAttribute('id'));
  }
  
  async function handleAccelerate() {
	// DONE - Invoke the API call to accelerate

	if (!store.is_started) {
	  return;
	}
	const result = accelerate(store.race_id);
  }
  
  // HTML VIEWS ------------------------------------------------
  // Provided code - do not remove
  
  function renderRacerCars(racers) {
	if (!racers.length) {
	  return `
			  <h4>Loading Racers...</4>
		  `;
	}
  
	const results = racers.map(renderRacerCard).join('');
  
	return `
		  <ul id="racers">
			  ${results}
		  </ul>
	  `;
  }
  
  function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer;
  
	return `
		  <li class="card podracer" id="${id}">
			  <h3>${driver_name}</h3>
			  <p>${top_speed}</p>
			  <p>${acceleration}</p>
			  <p>${handling}</p>
		  </li>
	  `;
  }
  
  function renderTrackCards(tracks) {
	if (!tracks.length) {
	  return `
			  <h4>Loading Tracks...</4>
		  `;
	}
  
	const results = tracks.map(renderTrackCard).join('');
  
	return `
		  <ul id="tracks">
			  ${results}
		  </ul>
	  `;
  }
  
  function renderTrackCard(track) {
	const { id, name } = track;
  
	return `
		  <li id="${id}" class="card track">
			  <h3>${name}</h3>
		  </li>
	  `;
  }
  
  function renderCountdown(count) {
	return `
		  <h2>Race Starts In...</h2>
		  <p id="big-numbers">${count}</p>
	  `;
  }
  
  function renderRaceStartView(track, racers) {
	return `
		  <header>
			  <h1>Race: ${track.name}</h1>
		  </header>
		  <main id="two-columns">
			  <section id="leaderBoard">
				  ${renderCountdown(3)}
			  </section>
  
			  <section id="accelerate">
				  <h2>Directions</h2>
				  <p>Click the button as fast as you can to make your racer go faster!</p>
				  <button id="gas-peddle">Click Me To Win!</button>
			  </section>
		  </main>
		  <footer></footer>
	  `;
  }
  
  function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position ? 1 : -1));
  
	return `
		  <header>
			  <h1>Race Results</h1>
		  </header>
		  <main>
			  ${raceProgress(positions)}
			  <a href="/race">Start a new race</a>
		  </main>
	  `;
  }
  
  function raceProgress(positions) {
	let userPlayer = positions.find(e => e.id === store.player_id);
	userPlayer.driver_name += ' (you)';
  
	positions = positions.sort((a, b) => (a.segment > b.segment ? -1 : 1));
	let count = 1;
  
	const results = positions.map(p => {
	  return `
			  <tr>
				  <td>
					  <h3>${count++} - ${p.driver_name}</h3>
				  </td>
			  </tr>
		  `;
	});
  
	return `
		  <main>
			  <h3>Leaderboard</h3>
			  <section id="leaderBoard">
				  ${results}
			  </section>
		  </main>
	  `;
  }
  
  function renderAt(element, html) {
	const node = document.querySelector(element);
  
	node.innerHTML = html;
  }
  
  // ^ Provided code ^ do not remove
  
  // API CALLS ------------------------------------------------
  
  const SERVER = 'http://localhost:8000';
  
  function defaultFetchOpts() {
	return {
	  mode: 'cors',
	  headers: {
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': SERVER,
	  },
	};
  }
  
  // DONE - Make a fetch call (with error handling!) to each of the following API endpoints
  
  async function getTracks() {
	// GET request to `${SERVER}/api/tracks`
	let result;
	try {
	  result = await fetch(`${SERVER}/api/tracks`, {
		method: 'GET',
		...defaultFetchOpts(),
	  }).then(data => data.json())
	} catch (err) {
	  console.error('Error in getTracks', err);
	  result = undefined
	}
	return result
  }
  
  async function getRacers() {
	// GET request to `${SERVER}/api/cars`
	let result
	try {
	  result = await fetch(`${SERVER}/api/cars`, {
		method: 'GET',
		...defaultFetchOpts(),
	  }).then(data => data.json())
	} catch (err) {
	  console.error('Error in getRacers', err)
	  result = undefined
	}
	return result
  }
  
  async function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = {
	  player_id,
	  track_id,
	};
	let json
	try {
	  const response = fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body),
	  });
	  json = await response.then(res => res.json())
	} catch (err) {
	  console.error('Problem with createRace request::', err);
	}
	return json
  }
  
  async function getRace(id) {
	// GET request to `${SERVER}/api/races/${id}`
	let result;
	try {
	  result = await fetch(`${SERVER}/api/races/${id}`, {
		method: 'GET',
		...defaultFetchOpts(),
	  }).then(data => data.json())
	} catch (err) {
	  console.error('Error in getRace', err)
	}
	return result
  }
  
  async function startRace(id) {
	let result;
	try {
	  result = await fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	  });
	} catch (err) {
	  console.error('Problem with startRace request::', err)
	}
	return result
  }
  
  function accelerate(id) {
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	// options parameter provided as defaultFetchOpts
	// no body or datatype needed for this request
	return fetch(`${SERVER}/api/races/${id}/accelerate`, {
	  method: 'POST',
	  ...defaultFetchOpts(),
	}).catch(err => console.log('Problem with accelerate request::', err))
  }