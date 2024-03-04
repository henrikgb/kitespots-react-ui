import styleClasses from "@/pages/index.module.css";

interface StarRatingProps {
  score: number;
}

export const StarRating = ({ score }: StarRatingProps) => {
  const renderStars = () => {
    const stars = [];
    const yellowStars = Math.min(5, Math.max(0, score));

    for (let i = 0; i < yellowStars; i++) {
      stars.push(
        <span key={i} className={`${styleClasses.star}`}>
          &#9733;
        </span>
      );
    }

    const greyStars = Math.max(0, 5 - yellowStars);
    for (let i = 0; i < greyStars; i++) {
      stars.push(
        <span key={i + yellowStars} className={`${styleClasses.starRed}`}>
          &#9733;
        </span>
      );
    }

    return stars;
  };

  return <div className="star-rating">{renderStars()}</div>;
};
