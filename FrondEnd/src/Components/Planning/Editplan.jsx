import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import styled, { keyframes } from "styled-components";
import { ArrowLeft, X } from "react-feather";
import { fetchPlanById, updatePlan } from "../../services/api";

const EditPlan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tripData, setTripData] = useState({
    destination: "",
    start_date: "",
    end_date: "",
    status: "draft",
    notes: "",
    activities: "",
    budget: 0,
  });
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const data = await fetchPlanById(id);
        setTripData(data);
      } catch (error) {
        console.error("Error fetching plan:", error.response?.data || error.message);
        alert("Failed to load plan data.");
      }
    };
    loadPlan();
  }, [id]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        delay: i * 0.2,
        ease: "easeOut",
      },
    }),
  };

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTripData({ ...tripData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        ...tripData,
        budget: parseInt(tripData.budget),
      };
      await updatePlan(id, updatedData);
      setShowPopup(true); // Show pop-up on success
    } catch (error) {
      console.error("Error updating plan:", error.response?.data || error.message);
      alert("Failed to update plan.");
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    navigate("/Planning");
  };

  return (
    <Container
      as={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Navigation Bar */}
      <NavBar>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-white"
          >
            TravelVerse
          </motion.h1>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => navigate("/Planning")}
            className="flex items-center gap-2 text-gray-200 hover:text-white transition-colors duration-300"
          >
            <ArrowLeft size={20} />
            <span>Back to Planning</span>
          </motion.button>
        </div>
      </NavBar>

      <Content>
        <FormContainer>
          <LeftSection>
            <SectionTitle
              as={motion.h2}
              variants={itemVariants}
              custom={0}
            >
              Edit Your Trip
            </SectionTitle>
            <SectionSubtitle
              as={motion.p}
              variants={itemVariants}
              custom={1}
            >
              Update your journey with personalized itineraries and smarter adjustments
            </SectionSubtitle>
            <ServicesList>
              <ServiceItem
                as={motion.li}
                variants={itemVariants}
                custom={2}
              >
                ✈️ Modify Destinations
              </ServiceItem>
              <ServiceItem
                as={motion.li}
                variants={itemVariants}
                custom={3}
              >
                📅 Adjust Dates
              </ServiceItem>
              <ServiceItem
                as={motion.li}
                variants={itemVariants}
                custom={4}
              >
                💰 Update Budget
              </ServiceItem>
            </ServicesList>
          </LeftSection>
          <RightSection
            as={motion.div}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            animate="visible"
          >
            <FormHeader>Update Your Trip</FormHeader>
            <FormSubtitle>We’ll help you refine your plans!</FormSubtitle>
            <FormItem custom={0} variants={itemVariants}>
              <InputWrapper>
                <Input
                  type="text"
                  name="destination"
                  value={tripData.destination}
                  onChange={handleChange}
                  required
                  placeholder="Destination"
                />
              </InputWrapper>
            </FormItem>
            <FormItem custom={1} variants={itemVariants}>
              <InputWrapper>
                <Input
                  type="date"
                  name="start_date"
                  value={tripData.start_date}
                  onChange={handleChange}
                  required
                  placeholder="Start Date"
                />
              </InputWrapper>
            </FormItem>
            <FormItem custom={2} variants={itemVariants}>
              <InputWrapper>
                <Input
                  type="date"
                  name="end_date"
                  value={tripData.end_date}
                  onChange={handleChange}
                  required
                  placeholder="End Date"
                />
              </InputWrapper>
            </FormItem>
            <FormItem custom={3} variants={itemVariants}>
              <InputWrapper>
                <Select
                  name="status"
                  value={tripData.status}
                  onChange={handleChange}
                >
                  <option value="draft">Draft</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </InputWrapper>
            </FormItem>
            <FormItem custom={4} variants={itemVariants}>
              <InputWrapper>
                <Input
                  type="number"
                  name="budget"
                  value={tripData.budget}
                  onChange={handleChange}
                  required
                  placeholder="Budget"
                />
              </InputWrapper>
            </FormItem>
            <FormItem custom={5} variants={itemVariants}>
              <InputWrapper>
                <Textarea
                  name="activities"
                  value={tripData.activities}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Activities"
                />
              </InputWrapper>
            </FormItem>
            <FormItem custom={6} variants={itemVariants}>
              <InputWrapper>
                <Textarea
                  name="notes"
                  value={tripData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Add Comments..."
                />
              </InputWrapper>
            </FormItem>
            <FormItem custom={7} variants={itemVariants}>
              <SubmitButton
                as={motion.button}
                type="button"
                onClick={handleSubmit}
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255, 215, 0, 0.5)" }}
                whileTap={{ scale: 0.95 }}
              >
                Update Trip
              </SubmitButton>
            </FormItem>
          </RightSection>
        </FormContainer>
      </Content>

      {/* Pop-up Modal */}
      {showPopup && (
        <PopupOverlay>
          <Popup
            as={motion.div}
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <PopupCloseButton onClick={closePopup}>
              <X size={20} />
            </PopupCloseButton>
            <PopupContent>
              <PopupTitle>Trip Updated Successfully!</PopupTitle>
              <PopupMessage>
                Your trip has been updated. Ready for an amazing journey!
              </PopupMessage>
              <PopupButton
                as={motion.button}
                onClick={closePopup}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Continue
              </PopupButton>
            </PopupContent>
          </Popup>
        </PopupOverlay>
      )}
    </Container>
  );
};

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.5);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(255, 215, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 215, 0, 0);
  }
`;

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
  color: #fff;
  background: radial-gradient(circle at center, #1a1a1a 0%, #0b0b0b 100%);
`;

const NavBar = styled.nav`
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(12px);
  z-index: 50;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Content = styled.div`
  flex: 1;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FormContainer = styled.div`
  display: flex;
  max-width: 1000px;
  width: 100%;
  height: 90%;
  background: linear-gradient(135deg, #1e1a5f 50%, #121212 50%);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
  overflow: hidden;
  margin-top: 4rem;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }
`;

const LeftSection = styled.div`
  flex: 1;
  padding: 2rem;
  background: linear-gradient(135deg, #2b1a5f, #5b3a9f);
  background-size: 100% 100%;
  animation: ${gradientAnimation} 15s ease infinite;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  max-height: 700px;

  @media (max-width: 768px) {
    padding: 2rem;
    text-align: center;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.8rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const SectionSubtitle = styled.p`
  font-size: 1.2rem;
  color: #e0e0e0;
  line-height: 1.6;
  opacity: 0.9;
  font-weight: 300;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

const ServicesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ServiceItem = styled.li`
  font-size: 1.1rem;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  opacity: 0.95;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const RightSection = styled.div`
  flex: 2;
  padding: 1rem 2.5rem;
  background: #121212;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const FormHeader = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.3px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

const FormSubtitle = styled.p`
  font-size: 1rem;
  color: #b0b0b0;
  font-weight: 300;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

const FormItem = styled(motion.div)`
  display: flex;
  flex-direction: column;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: none;
  border-radius: 10px;
  font-size: 0.75rem;
  background-color: #2a2a2a;
  color: #fff;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  height: 2.5rem;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(91, 58, 159, 0.3), 0 0 8px rgba(91, 58, 159, 0.5);
    background-color: #333;
  }

  &:not(:placeholder-shown),
  &:focus {
    background-color: #333;
  }

  &::placeholder {
    color: #888;
    font-style: italic;
  }

  &:hover {
    background-color: #333;
  }
`;

const Select = styled.select`
  padding: 0.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.75rem;
  background-color: #2a2a2a;
  color: #fff;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23888' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(91, 58, 159, 0.3);
    background-color: #333;
  }

  &:hover {
    background-color: #333;
  }

  option {
    background: #2a2a2a;
    color: #fff;
  }
`;

const Textarea = styled.textarea`
  padding: 0.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.75rem;
  background-color: #2a2a2a;
  color: #fff;
  resize: none;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(91, 58, 159, 0.3), 0 0 8px rgba(91, 58, 159, 0.5);
    background-color: #333;
  }

  &:not(:placeholder-shown),
  &:focus {
    background-color: #333;
  }

  &::placeholder {
    color: #888;
    font-style: italic;
  }

  &:hover {
    background-color: #333;
  }
`;

const SubmitButton = styled.button`
  padding: 0.7rem 2.5rem;
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  color: #1a1a1a;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-end;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  animation: ${pulseAnimation} 2s infinite;

  &:hover {
    background: linear-gradient(135deg, #ffaa00, #ffd700);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

const Popup = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  position: relative;
`;

const PopupCloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

const PopupContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const PopupTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffd700;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

const PopupMessage = styled.p`
  font-size: 1rem;
  color: #e0e0e0;
  text-align: center;
  font-weight: 300;
`;

const PopupButton = styled.button`
  padding: 0.7rem 2rem;
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  color: #1a1a1a;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);

  &:hover {
    background: linear-gradient(135deg, #ffaa00, #ffd700);
  }
`;

export default EditPlan;