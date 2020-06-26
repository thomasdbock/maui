import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import Picture from './Picture';
import { getRandomPicture } from '../photo';

const Container = styled.div`
	position: relative;
	min-height: 100vh;
	width: 100%;
`;

// TODO: Look at firebase hosting

const App = () => {
	const [picture, setPicture] = useState(null);

	useEffect(() => {
		setPicture(getRandomPicture());
	}, []);

	return (
		<Container>
			<Picture
				src={picture}
				alt="Picture of Maui 😻"
				onClick={() => {
					setPicture(getRandomPicture());
				}}
			/>
		</Container>
	);
};

export default App;
