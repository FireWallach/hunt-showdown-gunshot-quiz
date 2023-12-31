import React, { Component } from 'react';
import { Container, Row, Col, Button, ProgressBar, ButtonGroup } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle, FaPlay } from 'react-icons/fa';
import { ImCross } from 'react-icons/im';
import gunshots from '../data/gunshotSounds';
import "./BodyCard.css"

class BodyCard extends Component {
    constructor() {
        super();
        this.state = {
            correct: 0,
            incorrect: 0,
            fullChoices: [],
            choices: [],
            answerIndex: null,
            clicked: {},
            isGuessed: false,
            thumbnailUrl: '/images/mystery.png',
            timeLeft: 3,
            choiceCount: 4,
            streak: 0,
            filter: 0
        }
        this.ammoTypes = ["", "Compact", "Medium", "Long", "Shotgun", "Special"]
    }

    componentDidMount() {
        this.generateChoices();
    }

    componentWillUnmount() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
    }

    handleSoundButtonClick = () => {
        const audio = new Audio(this.state.fullChoices[this.state.answerIndex].sound);
        audio.play();
    }

    handleFilterClick(index) {
        let filteredChoices = [];
        if (index > 0) {
            filteredChoices = this.state.fullChoices.filter(choice => {
                return choice.ammo === this.ammoTypes[index];
            })
        } else {
            filteredChoices = this.state.fullChoices;
        }

        this.setState(prevState => {
            return {
                ...prevState,
                choices: filteredChoices,
                filter: index
            }
        })
    }

    handleSkipButtonClick = () => {
        this.resetQuestion();
    }



    guessGun = (gunName) => {
        if (gunName === this.state.fullChoices[this.state.answerIndex].name) {
            this.setState(prevState => ({
                correct: prevState.correct + 1,
                clicked: { ...prevState.clicked, [gunName]: 'success' },
                isGuessed: true,
                thumbnailUrl: prevState.fullChoices[prevState.answerIndex].image,
                streak: prevState.streak + 1
            }));
        } else {
            this.setState(prevState => ({
                incorrect: prevState.incorrect + 1,
                clicked: { ...prevState.clicked, [gunName]: 'danger' },
                isGuessed: true,
                thumbnailUrl: prevState.fullChoices[prevState.answerIndex].image,
                streak: 0
            }));
        }
        this.startCountdown();
    }

    startCountdown = () => {
        // Clear any existing interval
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        // Set a new interval to update timeLeft every second
        this.countdownInterval = setInterval(() => {
            this.setState(prevState => {
                if (prevState.timeLeft > 0) {
                    return { timeLeft: prevState.timeLeft - 1 };
                } else {
                    clearInterval(this.countdownInterval);
                    this.countdownInterval = null;
                    this.resetQuestion();
                    return { timeLeft: 0 };
                }
            });
        }, 1000);
    }

    resetQuestion = () => {
        if (!this.state.isGuessed) {
            return;
        }
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }

        this.generateChoices();
        this.setState({
            isGuessed: false,
            timeLeft: 3,
            clicked: {},
            thumbnailUrl: '/images/mystery.png',
            filter: 0
        });
    }

    generateChoices = () => {
        let newChoiceCount = this.state.choiceCount;

        if (this.state.streak > 1 && this.state.choiceCount < gunshots.length) {
            newChoiceCount++;
        } else if (this.state.streak === 0 && this.state.choiceCount > 4) {
            newChoiceCount--;
        }

        this.setState({
            choiceCount: newChoiceCount
        });

        let choices = [];
        while (choices.length < newChoiceCount) {
            let index = this.getRandomInt(0, gunshots.length - 1);
            if (!choices.some(gun => gun.name === gunshots[index].name)) {
                choices.push(gunshots[index]);
            }
        }
        choices = choices.sort((a, b) => {
            if (a.item1 === b.item1) {
                return a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
            }
            return 0;
        });
        let fullChoices = [...choices]
        this.setState({
            choices,
            fullChoices,
            answerIndex: this.getRandomInt(0, this.state.choiceCount - 1),
        });
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    renderChoiceButtons() {
        return this.state.choices.map((gun) => {
            const clicked = this.state.clicked[gun.name];
            let variant, icon;
            if (clicked) {
                variant = clicked;
                icon = clicked === 'success' ? <FaCheckCircle /> : <FaTimesCircle />;
            } else {
                variant = 'outline-light';
                icon = null;
            }
            return (
                <Col>
                    <Row className='align-items-center justify-content-around'>
                        <Button
                            key={gun.name}
                            className="m-2 mt-5 choice-button"
                            variant={variant}
                            onClick={() => this.guessGun(gun.name)}
                            disabled={this.state.isGuessed}
                        >
                            <Container>
                                <Row>
                                    <Col>
                                        <img className="gun-thumbnail" src={gun.image} alt='gun thumbnail' />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        {icon} {gun.name}
                                    </Col>
                                </Row>
                            </Container>
                        </Button>
                    </Row>
                </Col>
            );
        });
    }

    render() {
        const { correct, incorrect } = this.state;

        // Calculate the total number of guesses
        const total = correct + incorrect;
        // Calculate the percentage of correct and incorrect guesses
        const correctPercentage = total > 0 ? Math.round((correct / total) * 100) : 0;
        const incorrectPercentage = total > 0 ? Math.round((incorrect / total) * 100) : 0;

        return (
            <div className='text-light p-4 mb-4 rounded bg-secondary'>
                <Container>
                    <Row className='align-items-center'>
                        <Col xs={5}>
                            <h1>
                                <span className='correct'>{correct}</span> / <span className='incorrect'>{incorrect}</span> | Streak: {this.state.streak} {this.state.isGuessed && <span>-- Next Round in {this.state.timeLeft}s</span>}
                            </h1>
                            <ProgressBar>
                                <ProgressBar variant="success" now={correctPercentage} key={1} label={`${correctPercentage}%`} />
                                <ProgressBar variant="danger" now={incorrectPercentage} key={2} label={`${incorrectPercentage}%`} />
                            </ProgressBar>
                        </Col>
                        <Col>
                            <Row className='justify-content-md-center'>
                                <Button onClick={this.handleSoundButtonClick} className='control-button mb-1' variant='success'><FaPlay /> Play Sound</Button>
                                {this.state.isGuessed && <Button onClick={this.handleSkipButtonClick} className='control-button' variant='success'>Skip Timer</Button>}
                            </Row>
                        </Col>
                        <Col>
                            <img src={this.state.thumbnailUrl} className='img-fluid mystery-gun' alt="Mystery Gun" />
                            {this.state.isGuessed && <h2>{this.state.fullChoices[this.state.answerIndex].name}</h2>}
                        </Col>
                    </Row>
                    <Row className='align-items-center justify-content-center mt-4'>
                        <ButtonGroup>
                            {this.ammoTypes.map((buttonName, index) => {
                                return (<Button
                                    variant={this.state.filter === index ? 'light' : 'outline-light'}
                                    onClick={() => this.handleFilterClick(index)}
                                >
                                    {buttonName ? buttonName : <ImCross />}
                                </Button>)
                            })}
                        </ButtonGroup>
                    </Row>
                    <Row className='justify-content-md-center align-items-center'>
                        {this.renderChoiceButtons()}
                    </Row>
                </Container>
            </div>
        );
    }

}

export default BodyCard;
