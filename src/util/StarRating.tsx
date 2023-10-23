import styleClasses from "@/pages/index.module.css";

interface StarRatingProps {
  score: number;
}

export const StarRating = ({ score }: StarRatingProps) => {
  const renderStars = () => {
    const stars = [];
    // Calculate the number of yellow stars (up to 5)
    const yellowStars = Math.min(5, Math.max(0, score));

    for (let i = 0; i < yellowStars; i++) {
      stars.push(
        <span key={i} className={`${styleClasses.star}`}>
          &#9733;
        </span>
      );
    }

    // Calculate the number of gray stars (up to 5)
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
