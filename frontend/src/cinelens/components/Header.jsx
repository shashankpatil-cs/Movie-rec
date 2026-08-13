export default function Header() {
  return (
    <header className="header">
      <p className="eyebrow">MovieLens 1M · Recommender Bake-off</p>
      <h1>
        Cine<em>Lens</em>
      </h1>
      <p>
        Three recommenders, one held-out test set. Compare item-based collaborative filtering
        (Pearson, Spearman, or Kendall correlation) against a TF-IDF genre model and a hybrid of
        the two, scored with Precision@10, Recall@10, and Hit Rate@10 across five sampled users.
      </p>
      <div className="sprocket-rule">
        <div className="sprocket-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </header>
  );
}
