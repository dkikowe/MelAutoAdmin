import { useNavigate } from "react-router-dom"

const Unauthorized = () => {
    const navigate = useNavigate();

    const goBack = () => navigate(-1);

    return (
        <section>
            <h1>Unauthorized</h1>
            <br />
            <p>У вас нет доступа к странице</p>
            <div className="flexGrow">
                <button onClick={goBack}>Вернуться</button>
            </div>
        </section>
    )
}

export default Unauthorized
