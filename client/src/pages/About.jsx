// client/src/pages/About.jsx
import React from 'react';
import '../styles/About.css';

const About = () => {
  return (
    <div className="about-container">
      <h1>À propos de Jotiya</h1>

      <section>
        <h2>Notre histoire</h2>
        <p>
          Le nom "Jotiya" évoque le marché aux puces, un lieu où l'on découvre des trésors cachés. C'est dans cet esprit que notre boutique en ligne a été créée. Jotiya est plus qu'un simple site de vente, c'est une vitrine pour des objets uniques, qui portent une histoire et une âme.
        </p>
      </section>

      <section>
        <h2>Notre mission</h2>
        <p>
          Notre mission est de redonner vie aux produits vintage et de qualité. Chaque article est soigneusement sélectionné pour son authenticité et son charme. Nous croyons que la beauté ne se limite pas au neuf, et que les objets d'occasion méritent une seconde chance.
        </p>
      </section>

      <section>
        <h2>Comment ça marche ?</h2>
        <p>
          Tous les produits présentés sur Jotiya sont gérés et vendus directement par notre équipe. Vous pouvez parcourir notre collection, ajouter les articles qui vous plaisent à votre panier et finaliser votre achat en toute sécurité via notre système de paiement sécurisé.
        </p>
        <p>
          Nous nous occupons de l'emballage et de l'expédition pour que votre commande vous parvienne dans les meilleures conditions.
        </p>
      </section>
      
      <section>
        <h2>Notre collection</h2>
        <ul>
          <li><strong>Vintage :</strong> Des vêtements, meubles et accessoires qui ont traversé le temps.</li>
          <li><strong>Objets uniques :</strong> Des pièces rares et originales que vous ne trouverez nulle part ailleurs.</li>
          <li><strong>Qualité :</strong> Des articles en bon état, prêts à être aimés à nouveau.</li>
        </ul>
      </section>

      <section>
        <h2>Rejoignez notre communauté</h2>
        <p>
          Suivez-nous sur les réseaux sociaux pour découvrir nos dernières trouvailles et pour vous inspirer de l'univers de Jotiya.
        </p>
      </section>
    </div>
  );
};

export default About;