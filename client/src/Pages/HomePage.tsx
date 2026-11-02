import homeImg from "../assets/home.png";

const HomePage = ({ onHomeClick }: { onHomeClick: () => void }) => {
	return (
		<div className="w-full">
			<button className="cursor-pointer" onClick={onHomeClick}>
				<img src={homeImg} alt="" />
			</button>
		</div>
	);
};

export default HomePage;
