import React from 'react';
import '../styles/About.css';

const About = () => {
  return (
    <div className="about-container">
      <h1>À propos de Jotiya</h1>

      <section>
        <h2>Pourquoi Jotiya ?</h2>
        <p>
          Jotiya est née d’une idée simple : permettre aux vendeurs du marché aux puces
          – souvent appelés <strong>« jotya »</strong> – de vendre leurs produits en ligne, facilement et rapidement.
          Que vous ayez des objets d’occasion, des meubles, des vêtements ou de l’électronique,
          vous pouvez les proposer à la vente sur notre plateforme.
        </p>
      </section>

      <section>
        <h2>Comment ça marche ?</h2>
        <p>
          Chaque vendeur peut publier une annonce avec photos, description et informations de contact.
          Les acheteurs intéressés peuvent ensuite contacter directement le vendeur via son
          <strong> numéro de téléphone</strong> 
        </p>
        <p className="note">
          🔒 Aucun système de chat ou de paiement intégré n’est proposé pour les vendeurs classiques.
          La négociation et le paiement se font <strong>en dehors de la plateforme</strong>, entre le vendeur et l’acheteur.
        </p>
      </section>

      <section>
        <h2>Et pour les produits proposés par l’équipe Jotiya ?</h2>
        <p>
          Certains produits sont publiés directement par <strong>l’équipe Jotiya (admin)</strong>.
          Dans ce cas, un bouton <em>"Ajouter au panier"</em> est disponible, et le paiement peut se faire
          <strong> en toute sécurité via PayPal</strong> directement sur notre site.
        </p>
        <p>
          Cela permet aux utilisateurs qui souhaitent acheter immédiatement, sans passer par un contact externe,
          de finaliser leur achat de façon simple et sécurisée.
        </p>
      </section>

      <section>
        <h2>Pour qui est fait ce site ?</h2>
        <ul>
          <li><strong>Vendeurs :</strong> Toute personne souhaitant vendre des objets d’occasion.</li>
          <li><strong>Acheteurs :</strong> Ceux qui cherchent des bonnes affaires ou des produits uniques.</li>
          <li><strong>Administrateurs :</strong> Ils gèrent la plateforme et peuvent proposer certains produits en vente directe.</li>
        </ul>
      </section>

      <section>
        <h2>Ce qui rend Jotiya unique</h2>
        <ul>
          <li> Ciblage spécifique du <strong>marché aux puces marocain</strong>, souvent ignoré en ligne.</li>
          <li> <strong>Contact direct</strong> entre vendeur et acheteur : simple et sans intermédiaire.</li>
          <li> <strong>Paiement sécurisé via PayPal</strong> uniquement pour les produits publiés par l’admin.</li>
        </ul>
      </section>

      

      
    </div>
  );
};

export default About;
