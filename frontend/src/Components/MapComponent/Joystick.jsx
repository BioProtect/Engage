import React, { useRef, useEffect } from "react";

const Joystick = ({ map, size = 90 }) => {
  const joystickRef = useRef(null);
  const knobRef = useRef(null);
  const velocityRef = useRef({ x: 0, y: 0 });
  const maxRadius = 35;
  let pointerId = null;

  const getVelocity = (dx, dy) => {
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxRadius) {
      const scale = maxRadius / distance;
      dx *= scale;
      dy *= scale;
    }

    const zoom = map.getView().getZoom();
    const baseSpeed = 0.01;
    const damping = 1 / Math.pow(2, zoom - 5);
    let velocity = {
      x: dx * baseSpeed * damping,
      y: -dy * baseSpeed * damping,
    };

    const factor = Math.pow(distance / maxRadius, 2.5);
    velocity = { x: velocity.x * factor, y: velocity.y * factor };

    return velocity;
  };

  useEffect(() => {
    const joystick = joystickRef.current;
    const knob = knobRef.current;

    let rafId;

    const onPointerDown = (e) => {
      pointerId = e.pointerId;
      joystick.setPointerCapture(pointerId);
      e.preventDefault();
    };
    const onPointerMove = (e) => {
      if (pointerId !== e.pointerId) return;
      const rect = joystick.getBoundingClientRect();
      let dx = e.clientX - (rect.left + rect.width / 2);
      let dy = e.clientY - (rect.top + rect.height / 2);

      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > maxRadius) {
        const scale = maxRadius / distance;
        dx *= scale;
        dy *= scale;
      }

      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      velocityRef.current = getVelocity(dx, dy);
      e.preventDefault();
    };
    const onPointerUp = (e) => {
      if (pointerId !== e.pointerId) return;
      pointerId = null;
      velocityRef.current = { x: 0, y: 0 };
      knob.style.transform = "translate(0px, 0px)";
    };

    joystick.addEventListener("pointerdown", onPointerDown);
    joystick.addEventListener("pointermove", onPointerMove);
    joystick.addEventListener("pointerup", onPointerUp);
    joystick.addEventListener("pointercancel", onPointerUp);

    const animate = () => {
      const v = velocityRef.current;
      if ((v.x || v.y) && map) {
        const view = map.getView();
        const [cx, cy] = view.getCenter();
        view.setCenter([cx + v.x, cy + v.y]);
      }
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      joystick.removeEventListener("pointerdown", onPointerDown);
      joystick.removeEventListener("pointermove", onPointerMove);
      joystick.removeEventListener("pointerup", onPointerUp);
      joystick.removeEventListener("pointercancel", onPointerUp);
    };
  }, [map]);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: "rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        margin: "0 auto",
      }}
    >
      <div
        ref={joystickRef}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          touchAction: "none",
        }}
      >
        <div
          ref={knobRef}
          style={{
            width: size / 2,
            height: size / 2,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.9)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          }}
        />
      </div>
    </div>
  );
};

export default Joystick;
