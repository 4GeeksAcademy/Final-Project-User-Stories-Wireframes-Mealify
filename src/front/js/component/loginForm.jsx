import React, { useState } from "react";

export const LoginForm = ({ onSubmit }) => {
	const [formData, setFormData] = useState({
		identifier: "", // Puede ser usuario o email
		password: "",
	});

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!formData.identifier || !formData.password) {
			alert("Todos los campos son obligatorios.");
			return;
		}
		await onSubmit(formData);
	};

	return (
		<form onSubmit={handleSubmit} className="contact-form__form">
			<div className="contact-form__field">
				<label htmlFor="user">User o Email</label>
				<input
					type="text"
					name="identifier"
					placeholder="Usuario o Email"
					value={formData.identifier}
					onChange={handleChange}
					required
					className="contact-form__input"
				/>
			</div>
			<div className="contact-form__field">
				<label htmlFor="password">Password</label>
				<input
					type="password"
					name="password"
					placeholder="Contraseña"
					value={formData.password}
					onChange={handleChange}
					required
					className="contact-form__input"
				/>
			</div>
			<button className="button button--primary" type="submit">
				Login
				<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_339_31545)">
                        <path d="M7.45293 12.3808C7.31768 12.2454 7.24171 12.0618 7.24171 11.8704C7.24171 11.679 7.31768 11.4954 7.45293 11.36L11.0353 7.77763L1.22226 7.77763C1.0307 7.77763 0.846994 7.70153 0.711544 7.56608C0.576095 7.43063 0.5 7.24692 0.5 7.05537C0.500001 6.86381 0.576095 6.6801 0.711545 6.54466C0.846994 6.40921 1.0307 6.33311 1.22226 6.33311L11.0353 6.33311L7.45293 2.75071C7.38197 2.68459 7.32506 2.60485 7.28558 2.51626C7.24611 2.42766 7.22488 2.33202 7.22317 2.23504C7.22146 2.13806 7.2393 2.04174 7.27562 1.9518C7.31195 1.86187 7.36602 1.78017 7.4346 1.71159C7.50318 1.643 7.58488 1.58894 7.67481 1.55261C7.76475 1.51629 7.86108 1.49845 7.95805 1.50016C8.05503 1.50187 8.15067 1.52309 8.23927 1.56257C8.32786 1.60205 8.4076 1.65896 8.47372 1.72992L13.2888 6.54497C13.424 6.6804 13.5 6.86397 13.5 7.05537C13.5 7.24677 13.424 7.43034 13.2888 7.56576L8.47372 12.3808C8.3383 12.5161 8.15473 12.592 7.96333 12.592C7.77193 12.592 7.58836 12.5161 7.45293 12.3808Z" fill="white"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_339_31545">
                        <rect width="13" height="13" fill="white" transform="translate(0.5 0.5)"/>
                    </clipPath>
                    </defs>
                </svg>
			</button>
		</form>
	);
};

