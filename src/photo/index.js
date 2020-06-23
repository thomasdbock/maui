import path from 'path';

const pictures = [];

const importAll = r => {
	r.keys().forEach(r => {
		pictures.push(path.resolve('./assets/', r));
	});
};
importAll(require.context('../photo', false, /\.(png|jpe?g|svg)$/));

export const getRandomPicture = () => {
	const index = Math.ceil(Math.random() * pictures.length - 1);
	return pictures[index];
};

export default pictures;
