import React, { useEffect, useState, useCallback, useMemo, createContext, useContext, useRef } from "react";
import { fetchPlans, deletePlan } from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import Calendar from "react-calendar";
import Modal from "react-modal";
import { FixedSizeList as List } from "react-window";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import "./TripList.css";

Modal.setAppElement("#root");

const SelectedDateContext = createContext();
const useSelectedDate = () => useContext(SelectedDateContext);

// Simulated react-query hook
const useQuery = (key, fetchFn) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
};

// Toast component
const Toast = ({ message, onClose }) => (
  <motion.div
    className="toast"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    transition={{ duration: 0.3 }}
  >
    <p>{message}</p>
    <button onClick={onClose} className="toast-close">×</button>
  </motion.div>
);

// Tooltip component
const Tooltip = ({ children, content, visible }) => (
  <div className="tooltip-container">
    {children}
    <AnimatePresence>
      {visible && (
        <motion.div
          className="tooltip"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const TripList = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [toast, setToast] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const cardRefs = useRef(new Map());

  // Fetch trips using simulated react-query
  const { data: trips, loading, error, refetch } = useQuery("trips", fetchPlans);

  // Handle errors
  useEffect(() => {
    if (error) {
      setToast({ message: "Failed to load trips. Please try again.", type: "error" });
    }
  }, [error]);

  // Handle trip deletion with undo
  const handleDelete = useCallback(
    (id) => {
      const trip = trips.find((t) => t.id === id);
      setPendingDelete({ id, trip });
      setToast({ message: `Trip to ${trip.destination} deleted.`, type: "info", undo: () => setPendingDelete(null) });

      const timeout = setTimeout(async () => {
        try {
          await deletePlan(id);
          refetch();
        } catch (err) {
          setToast({ message: "Failed to delete trip.", type: "error" });
        }
        setPendingDelete(null);
      }, 5000);

      return () => clearTimeout(timeout);
    },
    [trips, refetch]
  );

  // Filter trips by date
  const getTripsForDate = useCallback(
    (date) => {
      const formattedDate = date.toISOString().split("T")[0];
      return (trips || []).filter((trip) => {
        if (!trip.start_date || !trip.end_date) return false;
        const start = new Date(trip.start_date).toISOString().split("T")[0];
        const end = new Date(trip.end_date).toISOString().split("T")[0];
        return start <= formattedDate && end >= formattedDate;
      });
    },
    [trips]
  );

  // Memoize filtered trips
  const filteredTrips = useMemo(
    () => getTripsForDate(selectedDate),
    [selectedDate, getTripsForDate]
  );

  // Calendar tile styling
  const tileClassName = ({ date, view }) => {
    if (view !== "month") return "";
    const tripsOnDate = getTripsForDate(date);
    return tripsOnDate.length > 0 ? "calendar-tile-highlight" : "";
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -20 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  // Ripple effect for buttons
  const createRipple = (event) => {
    const button = event.currentTarget;
    const ripple = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
    ripple.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
    ripple.classList.add("ripple");

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  // Skeleton loader
  const SkeletonCard = () => (
    <div className="skeleton-card">
      <div className="skeleton-title"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-buttons">
        <div className="skeleton-button"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );

  // Virtualized trip card
  const TripCard = ({ index, style, data }) => {
    const trip = data[index];
    return (
      <motion.div
        style={style}
        layoutId={`trip-${trip.id}`}
        className="trip-card"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ delay: index * 0.1 }}
        onClick={() => {
          setSelectedTrip(trip);
          setModalIsOpen(true);
        }}
        whileTap={{ y: -2, boxShadow: "0 4px 12px #000000" }}
      >
        <motion.div>
          <motion.h3 className="trip-title">{trip.destination}</motion.h3>
          <motion.p className="trip-date">
            {new Date(trip.start_date).toLocaleDateString()} -{" "}
            {new Date(trip.end_date).toLocaleDateString()} (
            {Math.ceil(
              (new Date(trip.end_date) - new Date(trip.start_date)) /
                (1000 * 60 * 60 * 24)
            ) + 1}{" "}
            days)
          </motion.p>
          <motion.p className="trip-notes">{trip.notes || "Explore your journey!"}</motion.p>
          <motion.div className="trip-buttons" variants={itemVariants}>
            <motion.button
              className="edit-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.stopPropagation();
                createRipple(e);
                window.location.href = `/edit-trip/${trip.id}`;
              }}
            >
              Edit
            </motion.button>
            <motion.button
              className="delete-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.stopPropagation();
                createRipple(e);
                handleDelete(trip.id);
              }}
            >
              Delete
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <motion.div
        className="loading-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div
          className="loading-spinner"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.p variants={itemVariants} className="loading-text">
          Loading your adventures...
        </motion.p>
      </motion.div>
    );
  }

  return (
    <SelectedDateContext.Provider value={{ selectedDate, setSelectedDate }}>
      <div className="app-container">
        <Particles
          params={{
            particles: {
              number: { value: 80, density: { enable: true, value_area: 800 } },
              color: { value: "#ffffff" },
              shape: { type: "circle" },
              opacity: { value: 0.5, random: true, anim: { enable: false } },
              size: { value: 3, random: true, anim: { enable: false } },
              line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
              move: { enable: true, speed: 2, direction: "none", random: false, straight: false, out_mode: "out" }
            },
            interactivity: { events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } } }
          }}
        />
        <motion.div className="content-wrapper" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
          {/* Toast Notifications */}
          <AnimatePresence>
            {toast && (
              <Toast
                message={toast.message}
                onClose={() => {
                  if (toast.undo) toast.undo();
                  setToast(null);
                }}
              />
            )}
          </AnimatePresence>

          {/* Navbar */}
          <motion.nav className="navbar" variants={containerVariants}>
            <div className="navbar-content">
              
              <motion.h1
                className="navbar-title"
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}

              >
                TravelVerse
              </motion.h1>
              <motion.button
                className="back-button"
                initial={{ x: 20 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => (window.location.href = "/home")}
              >
                <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </motion.button>
            </div>
          </motion.nav>

          {/* Main Layout */}
          <div className="main-layout">
            {/* Fixed Sidebar */}
            <motion.aside className="sidebar" variants={containerVariants}>
              <motion.div className="sidebar-content" variants={itemVariants}>
                <motion.button
                  className="add-trip-button"
                  onClick={() => (window.location.href = "/plan-trip")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  variants={itemVariants}
                >
                  + Add New Trip
                </motion.button>
                <motion.div variants={itemVariants}>
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    tileClassName={tileClassName}
                    tileContent={({ date, view }) => {
                      const tripsOnDate = getTripsForDate(date);
                      return view === "month" && tripsOnDate.length > 0 ? (
                        <Tooltip
                          content={tripsOnDate.map((trip) => trip.destination).join(", ")}
                          visible={hoveredDate?.toISOString() === date.toISOString()}
                        >
                          <motion.div
                            className="calendar-dot"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            onMouseEnter={() => setHoveredDate(date)}
                            onMouseLeave={() => setHoveredDate(null)}
                          />
                        </Tooltip>
                      ) : null;
                    }}
                    className="custom-calendar"
                  />
                </motion.div>
              </motion.div>
            </motion.aside>

            {/* Main Content */}
            <motion.main className="main-content" variants={containerVariants}>
              <motion.header variants={itemVariants}>
                <h2 className="main-title">
                  Trips for{" "}
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h2>
              </motion.header>
              <AnimatePresence mode="wait">
                {filteredTrips.length > 0 ? (
                  <List
                    height={600}
                    itemCount={filteredTrips.length}
                    itemSize={200}
                    width="100%"
                    itemData={filteredTrips}
                  >
                    {TripCard}
                  </List>
                ) : (
                  <motion.p
                    className="no-trips"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    No trips scheduled for this date.
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.main>
          </div>

          {/* Modal */}
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            className="modal"
            overlayClassName="modal-overlay"
            aria={{ labelledby: "modal-title", describedby: "modal-description" }}
          >
            {selectedTrip && (
              <motion.div
                className="modal-content"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="modal-header">
                  <h2 id="modal-title" className="modal-title">{selectedTrip.destination}</h2>
                  <motion.span
                    className="modal-status"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                  >
                    {selectedTrip.status === "completed" ? "Completed" : "In Progress"}
                  </motion.span>
                </div>
                <div className="modal-detail">
                  <h3>Dates</h3>
                  <p id="modal-description">
                    {new Date(selectedTrip.start_date).toLocaleDateString()} -{" "}
                    {new Date(selectedTrip.end_date).toLocaleDateString()} (
                    {Math.ceil(
                      (new Date(selectedTrip.end_date) - new Date(selectedTrip.start_date)) /
                      (1000 * 60 * 60 * 24)
                    ) + 1} days)
                  </p>
                </div>
                <div className="modal-detail">
                  <h3>Notes</h3>
                  <p>{selectedTrip.notes || "No notes available"}</p>
                </div>
                <div className="modal-detail">
                  <h3>Budget</h3>
                  <p>{selectedTrip.budget || "Budget not specified"}</p>
                </div>
                <motion.button
                  className="modal-close-btn"
                  onClick={() => setModalIsOpen(false)}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  x
                </motion.button>
              </motion.div>
            )}
          </Modal>
        </motion.div>
      </div>
    </SelectedDateContext.Provider>
  );
};

export default TripList;