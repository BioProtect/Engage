--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-08-07 11:46:10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 27392)
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- TOC entry 5843 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 228 (class 1259 OID 61304)
-- Name: drawingitems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drawingitems (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    color character varying(7) NOT NULL,
    description text,
    type character varying(20) NOT NULL
);


ALTER TABLE public.drawingitems OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 61303)
-- Name: drawingitems_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.drawingitems_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.drawingitems_id_seq OWNER TO postgres;

--
-- TOC entry 5844 (class 0 OID 0)
-- Dependencies: 227
-- Name: drawingitems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.drawingitems_id_seq OWNED BY public.drawingitems.id;


--
-- TOC entry 226 (class 1259 OID 61295)
-- Name: savedpolygons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.savedpolygons (
    id integer NOT NULL,
    "user" text,
    usergroup text,
    name text,
    color text,
    description text,
    density integer,
    "timestamp" timestamp without time zone,
    geom public.geometry(Polygon,4326)
);


ALTER TABLE public.savedpolygons OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 61294)
-- Name: savedpolygons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.savedpolygons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.savedpolygons_id_seq OWNER TO postgres;

--
-- TOC entry 5845 (class 0 OID 0)
-- Dependencies: 225
-- Name: savedpolygons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.savedpolygons_id_seq OWNED BY public.savedpolygons.id;


--
-- TOC entry 224 (class 1259 OID 36709)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 36708)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5846 (class 0 OID 0)
-- Dependencies: 223
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 5666 (class 2604 OID 61307)
-- Name: drawingitems id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drawingitems ALTER COLUMN id SET DEFAULT nextval('public.drawingitems_id_seq'::regclass);


--
-- TOC entry 5665 (class 2604 OID 61298)
-- Name: savedpolygons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.savedpolygons ALTER COLUMN id SET DEFAULT nextval('public.savedpolygons_id_seq'::regclass);


--
-- TOC entry 5664 (class 2604 OID 36712)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5837 (class 0 OID 61304)
-- Dependencies: 228
-- Data for Name: drawingitems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drawingitems (id, name, color, description, type) FROM stdin;
21	Coral Reef	#FF6666	A diverse underwater ecosystem found in warm ocean waters.	Features
22	Fresh Water	#8A2BE2	A habitat of rivers, lakes, and ponds that are low in salt content.	Features
23	Kelp Forest	#32CD32	A coastal underwater forest of giant kelp plants, home to many species.	Features
24	Open Ocean	#1E90FF	The vast, deep waters of the ocean away from the coast.	Features
25	Salt Marsh	#D2691E	A coastal ecosystem of salt-tolerant plants and tidal waters.	Features
26	Overfishing	#FF4500	The depletion of fish species due to excessive fishing.	Activities
27	Pollution	#2E8B57	The introduction of harmful substances into the environment.	Activities
28	Rain	#4169E1	Precipitation in the form of water droplets falling from the sky.	Activities
29	Wind	#FFD700	The movement of air from high to low pressure areas.	Activities
\.


--
-- TOC entry 5835 (class 0 OID 61295)
-- Dependencies: 226
-- Data for Name: savedpolygons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.savedpolygons (id, "user", usergroup, name, color, description, density, "timestamp", geom) FROM stdin;
\.


--
-- TOC entry 5663 (class 0 OID 27714)
-- Dependencies: 219
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- TOC entry 5833 (class 0 OID 36709)
-- Dependencies: 224
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password) FROM stdin;
\.


--
-- TOC entry 5847 (class 0 OID 0)
-- Dependencies: 227
-- Name: drawingitems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drawingitems_id_seq', 29, true);


--
-- TOC entry 5848 (class 0 OID 0)
-- Dependencies: 225
-- Name: savedpolygons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.savedpolygons_id_seq', 1, true);


--
-- TOC entry 5849 (class 0 OID 0)
-- Dependencies: 223
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 28, true);


--
-- TOC entry 5677 (class 2606 OID 61315)
-- Name: drawingitems drawingitems_color_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drawingitems
    ADD CONSTRAINT drawingitems_color_key UNIQUE (color);


--
-- TOC entry 5679 (class 2606 OID 61313)
-- Name: drawingitems drawingitems_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drawingitems
    ADD CONSTRAINT drawingitems_name_key UNIQUE (name);


--
-- TOC entry 5681 (class 2606 OID 61311)
-- Name: drawingitems drawingitems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drawingitems
    ADD CONSTRAINT drawingitems_pkey PRIMARY KEY (id);


--
-- TOC entry 5675 (class 2606 OID 61302)
-- Name: savedpolygons savedpolygons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.savedpolygons
    ADD CONSTRAINT savedpolygons_pkey PRIMARY KEY (id);


--
-- TOC entry 5671 (class 2606 OID 36716)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5673 (class 2606 OID 36718)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


-- Completed on 2025-08-07 11:46:10

--
-- PostgreSQL database dump complete
--

