import React from 'react';

const ScrollHorizontal = ({ imageSrc, title, text, link }) => {
    return (
        <div className="card" style={{ width: '20rem' }}>
            <img src={imageSrc} className="card-img-top" alt={title} />
            <div className="card-body">
                <h5 className="card-title">{title}</h5>
                <p className="card-text">{text}</p>
                <a href={link} className="btn btn-primary">
                    Go somewhere
                </a>
            </div>
        </div>
    );
};

export default ScrollHorizontal;
