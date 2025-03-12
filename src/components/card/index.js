import "./index.scss";

const Card = ({
  title = "Title",
  date = "Date",
  description = "Description",
  link = "Link",
  keywords = "Keywords",
  thumbnail_img = "https://via.placeholder.com/150",
  id = Date.now().toString(),
}) => {
  return (
    <div id={id} className="custom-card">
      <img src={thumbnail_img} alt="thumbnail" />
      <h2>{title}</h2>
      <p>{description}</p>
      <p>{keywords}</p>
      <p>{date}</p>
      <a href={link}>Read more</a>
    </div>
  );
};

export default Card;
