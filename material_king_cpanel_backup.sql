--
-- PostgreSQL database dump
--

\restrict icE2td8amGPuWeIMdVOoI2FZAK3Byftn3qT5BDiZUGkfpX4syxPwwOzLGLfd9G9

-- Dumped from database version 18.3 (Debian 18.3-1.pgdg12+1)
-- Dumped by pg_dump version 18.2

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    logo_url text,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: brands_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.brands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: brands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.brands_id_seq OWNED BY public.brands.id;


--
-- Name: buyer_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.buyer_addresses (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    label character varying(50) DEFAULT 'Home'::character varying NOT NULL,
    full_name character varying(200) NOT NULL,
    phone character varying(20) NOT NULL,
    address_line1 text NOT NULL,
    address_line2 text,
    city character varying(100) NOT NULL,
    state character varying(100) NOT NULL,
    pincode character varying(10) NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: buyer_addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.buyer_addresses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: buyer_addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.buyer_addresses_id_seq OWNED BY public.buyer_addresses.id;


--
-- Name: buyers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.buyers (
    id integer NOT NULL,
    user_id uuid,
    company_name character varying(200),
    contact_name character varying(100),
    email character varying(255),
    phone character varying(20),
    gstin character varying(20),
    address text,
    city character varying(100),
    state character varying(100),
    pincode character varying(10),
    zone_id integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: buyers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.buyers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: buyers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.buyers_id_seq OWNED BY public.buyers.id;


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    product_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cart_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cart_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cart_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    parent_id integer,
    image_url text,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupons (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    discount_type character varying(20) DEFAULT 'percentage'::character varying NOT NULL,
    discount_value numeric(12,2) NOT NULL,
    min_order_amount numeric(14,2) DEFAULT 0 NOT NULL,
    max_discount numeric(14,2),
    usage_limit integer,
    used_count integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    valid_from timestamp with time zone DEFAULT now() NOT NULL,
    valid_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT coupons_discount_type_check CHECK (((discount_type)::text = ANY ((ARRAY['percentage'::character varying, 'fixed'::character varying])::text[])))
);


--
-- Name: coupons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.coupons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: coupons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.coupons_id_seq OWNED BY public.coupons.id;


--
-- Name: dealers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dealers (
    id integer NOT NULL,
    user_id uuid,
    company_name character varying(200) NOT NULL,
    contact_name character varying(100),
    email character varying(255),
    phone character varying(20),
    gstin character varying(20),
    address text,
    city character varying(100),
    state character varying(100),
    pincode character varying(10),
    zone_id integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: dealers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dealers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dealers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dealers_id_seq OWNED BY public.dealers.id;


--
-- Name: inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory (
    id integer NOT NULL,
    product_id integer NOT NULL,
    reorder_level integer DEFAULT 10 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inventory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inventory_id_seq OWNED BY public.inventory.id;


--
-- Name: inventory_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_transactions (
    id integer NOT NULL,
    product_id integer NOT NULL,
    transaction_type character varying(30) NOT NULL,
    quantity_change integer NOT NULL,
    quantity_before integer NOT NULL,
    quantity_after integer NOT NULL,
    reason text,
    reference_type character varying(30),
    reference_id character varying(50),
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT inventory_transactions_transaction_type_check CHECK (((transaction_type)::text = ANY ((ARRAY['add'::character varying, 'reduce'::character varying, 'reserve'::character varying, 'adjust'::character varying])::text[])))
);


--
-- Name: inventory_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inventory_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inventory_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inventory_transactions_id_seq OWNED BY public.inventory_transactions.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    total_price numeric(12,2) NOT NULL,
    fulfillment_status character varying(30) DEFAULT 'in_stock'::character varying,
    quantity_back_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT order_items_fulfillment_status_check CHECK (((fulfillment_status)::text = ANY ((ARRAY['in_stock'::character varying, 'back_order'::character varying])::text[])))
);


--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_status_history (
    id integer NOT NULL,
    order_id integer NOT NULL,
    from_status character varying(30),
    to_status character varying(30) NOT NULL,
    changed_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: order_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_status_history_id_seq OWNED BY public.order_status_history.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    order_number character varying(30) NOT NULL,
    buyer_id integer,
    dealer_id integer,
    vendor_id integer,
    status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    payment_method character varying(30) DEFAULT 'cod'::character varying NOT NULL,
    payment_status character varying(30) DEFAULT 'unpaid'::character varying NOT NULL,
    total_amount numeric(14,2) DEFAULT 0 NOT NULL,
    shipping_address text,
    notes text,
    expected_delivery_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT orders_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['cod'::character varying, 'upi'::character varying, 'netbanking'::character varying, 'card'::character varying])::text[]))),
    CONSTRAINT orders_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['unpaid'::character varying, 'paid'::character varying, 'refunded'::character varying])::text[]))),
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'pending_dealer_approval'::character varying, 'confirmed'::character varying, 'dispatched'::character varying, 'in_transit'::character varying, 'delivered'::character varying, 'partially_delivered'::character varying, 'cancelled'::character varying, 'disputed'::character varying])::text[])))
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: pricing_tiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pricing_tiers (
    id integer NOT NULL,
    product_id integer NOT NULL,
    min_qty integer NOT NULL,
    max_qty integer,
    price_per_unit numeric(12,2) NOT NULL,
    label character varying(100),
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pricing_tiers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pricing_tiers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pricing_tiers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pricing_tiers_id_seq OWNED BY public.pricing_tiers.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    sku character varying(50),
    hsn_code character varying(20),
    isin character varying(50),
    category_id integer,
    brand_id integer,
    brand_collection character varying(100),
    vendor_id integer,
    unit character varying(20) DEFAULT 'piece'::character varying,
    price numeric(12,2) DEFAULT 0 NOT NULL,
    mrp numeric(12,2),
    stock_qty integer DEFAULT 0 NOT NULL,
    min_order_qty integer DEFAULT 1 NOT NULL,
    image_url text,
    images jsonb DEFAULT '[]'::jsonb,
    specifications jsonb DEFAULT '{}'::jsonb,
    length_mm numeric(10,2),
    breadth_mm numeric(10,2),
    width_mm numeric(10,2),
    thickness_mm numeric(10,2),
    weight_kg numeric(10,3),
    box_length_mm numeric(10,2),
    box_breadth_mm numeric(10,2),
    box_width_mm numeric(10,2),
    box_weight_kg numeric(10,3),
    colour character varying(100),
    grade character varying(50),
    material character varying(100),
    calibration character varying(100),
    certification character varying(255),
    termite_resistance character varying(100),
    warranty character varying(100),
    country_of_origin character varying(100) DEFAULT 'India'::character varying,
    customer_care_details text,
    tech_sheet_url text,
    manufactured_by character varying(255),
    packaged_by character varying(255),
    lead_time_days integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    role character varying(50) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_roles_id_seq OWNED BY public.user_roles.id;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    refresh_token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_sessions_id_seq OWNED BY public.user_sessions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    password_hash text NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    user_type character varying(20) DEFAULT 'buyer'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    failed_login_attempts integer DEFAULT 0 NOT NULL,
    locked_until timestamp with time zone,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_user_type_check CHECK (((user_type)::text = ANY ((ARRAY['admin'::character varying, 'vendor'::character varying, 'buyer'::character varying, 'dealer'::character varying])::text[])))
);


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendors (
    id integer NOT NULL,
    user_id uuid,
    company_name character varying(200) NOT NULL,
    contact_name character varying(100),
    email character varying(255),
    phone character varying(20),
    gstin character varying(20),
    address text,
    city character varying(100),
    state character varying(100),
    pincode character varying(10),
    zone_id integer,
    is_active boolean DEFAULT true NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vendors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vendors_id_seq OWNED BY public.vendors.id;


--
-- Name: wishlists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wishlists (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: wishlists_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.wishlists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: wishlists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.wishlists_id_seq OWNED BY public.wishlists.id;


--
-- Name: zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.zones (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(20) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: zones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.zones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: zones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.zones_id_seq OWNED BY public.zones.id;


--
-- Name: brands id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands ALTER COLUMN id SET DEFAULT nextval('public.brands_id_seq'::regclass);


--
-- Name: buyer_addresses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buyer_addresses ALTER COLUMN id SET DEFAULT nextval('public.buyer_addresses_id_seq'::regclass);


--
-- Name: buyers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buyers ALTER COLUMN id SET DEFAULT nextval('public.buyers_id_seq'::regclass);


--
-- Name: cart_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: coupons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons ALTER COLUMN id SET DEFAULT nextval('public.coupons_id_seq'::regclass);


--
-- Name: dealers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dealers ALTER COLUMN id SET DEFAULT nextval('public.dealers_id_seq'::regclass);


--
-- Name: inventory id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory ALTER COLUMN id SET DEFAULT nextval('public.inventory_id_seq'::regclass);


--
-- Name: inventory_transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions ALTER COLUMN id SET DEFAULT nextval('public.inventory_transactions_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: order_status_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history ALTER COLUMN id SET DEFAULT nextval('public.order_status_history_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: pricing_tiers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_tiers ALTER COLUMN id SET DEFAULT nextval('public.pricing_tiers_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: user_roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles ALTER COLUMN id SET DEFAULT nextval('public.user_roles_id_seq'::regclass);


--
-- Name: user_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions ALTER COLUMN id SET DEFAULT nextval('public.user_sessions_id_seq'::regclass);


--
-- Name: vendors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors ALTER COLUMN id SET DEFAULT nextval('public.vendors_id_seq'::regclass);


--
-- Name: wishlists id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists ALTER COLUMN id SET DEFAULT nextval('public.wishlists_id_seq'::regclass);


--
-- Name: zones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones ALTER COLUMN id SET DEFAULT nextval('public.zones_id_seq'::regclass);


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.brands (id, name, slug, logo_url, description, is_active, created_at, updated_at) FROM stdin;
1	Kajaria	kajaria	\N	\N	t	2026-04-06 13:20:54.421759+00	2026-04-06 13:20:54.421759+00
2	Somany	somany	\N	\N	t	2026-04-06 13:20:54.421759+00	2026-04-06 13:20:54.421759+00
3	Asian Paints	asian-paints	\N	\N	t	2026-04-06 13:20:54.421759+00	2026-04-06 13:20:54.421759+00
4	Berger Paints	berger-paints	\N	\N	t	2026-04-06 13:20:54.421759+00	2026-04-06 13:20:54.421759+00
5	Hindware	hindware	\N	\N	t	2026-04-06 13:20:54.421759+00	2026-04-06 13:20:54.421759+00
6	Cera	cera	\N	\N	t	2026-04-06 13:20:54.421759+00	2026-04-06 13:20:54.421759+00
7	Godrej	godrej	\N	\N	t	2026-04-06 13:20:54.421759+00	2026-04-06 13:20:54.421759+00
8	Havells	havells	\N	\N	t	2026-04-06 13:20:54.421759+00	2026-04-06 13:20:54.421759+00
9	Finolex	finolex	\N	\N	t	2026-04-06 13:20:54.421759+00	2026-04-06 13:20:54.421759+00
10	Century Plyboards	century-plyboards	\N	\N	t	2026-04-06 13:20:54.421759+00	2026-04-06 13:20:54.421759+00
11	Greenply	greenply	\N	\N	t	2026-04-06 13:20:54.421759+00	2026-04-06 13:20:54.421759+00
12	Ultratech Cement	ultratech-cement	\N	\N	t	2026-04-06 13:20:54.421759+00	2026-04-06 13:20:54.421759+00
13	ACC Cement	acc-cement	\N	\N	t	2026-04-06 13:20:54.421759+00	2026-04-06 13:20:54.421759+00
14	Crompton	crompton	\N	\N	t	2026-04-06 13:20:54.421759+00	2026-04-06 13:20:54.421759+00
15	Polycab	polycab	\N	\N	t	2026-04-06 13:20:54.421759+00	2026-04-06 13:20:54.421759+00
16	RAK Ceramics	rak-ceramics	\N	\N	t	2026-04-06 13:20:54.421759+00	2026-04-06 13:20:54.421759+00
17	Jaquar	jaquar	\N	\N	t	2026-04-06 13:20:54.421759+00	2026-04-06 13:20:54.421759+00
18	Anchor by Panasonic	anchor-panasonic	\N	\N	t	2026-04-06 13:20:54.421759+00	2026-04-06 13:20:54.421759+00
19	Astral Pipes	astral-pipes	\N	\N	t	2026-04-06 13:20:54.421759+00	2026-04-06 13:20:54.421759+00
20	Supreme Pipes	supreme-pipes	\N	\N	t	2026-04-06 13:20:54.421759+00	2026-04-06 13:20:54.421759+00
\.


--
-- Data for Name: buyer_addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.buyer_addresses (id, user_id, label, full_name, phone, address_line1, address_line2, city, state, pincode, is_default, created_at, updated_at) FROM stdin;
1	7e5d1974-b943-47bf-843d-e7050cdf5b8a	Home	Viviya Roshan Wadkar	9876543210	45A/67, Start building, 	JSS Road, Marine Lines	Mumbai	MH	400002	t	2026-04-06 13:30:48.586926+00	2026-04-06 13:30:48.586926+00
\.


--
-- Data for Name: buyers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.buyers (id, user_id, company_name, contact_name, email, phone, gstin, address, city, state, pincode, zone_id, is_active, created_at, updated_at) FROM stdin;
1	7e5d1974-b943-47bf-843d-e7050cdf5b8a	Viviya Wadkar	Viviya Wadkar	viviya@gmail.com	9876543210	\N	\N	\N	\N	\N	\N	t	2026-04-06 13:25:38.653462+00	2026-04-06 13:25:38.653462+00
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_items (id, user_id, product_id, quantity, created_at, updated_at) FROM stdin;
6	f897a92f-38fe-4bfa-a7d7-17cc905776c2	55	50	2026-04-10 12:06:55.194921+00	2026-04-10 12:06:55.194921+00
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, slug, description, parent_id, image_url, is_active, sort_order, created_at, updated_at) FROM stdin;
1	Tiles & Flooring	tiles-flooring	Floor tiles, wall tiles, vitrified, ceramic, and natural stone	\N	\N	t	1	2026-04-06 13:20:54.53883+00	2026-04-06 13:20:54.53883+00
2	Paints & Coatings	paints-coatings	Interior paints, exterior paints, primers, and wood finishes	\N	\N	t	2	2026-04-06 13:20:54.53883+00	2026-04-06 13:20:54.53883+00
3	Sanitaryware & Bath	sanitaryware-bath	Toilets, basins, faucets, showers, and bath accessories	\N	\N	t	3	2026-04-06 13:20:54.53883+00	2026-04-06 13:20:54.53883+00
4	Hardware & Locks	hardware-locks	Door locks, handles, hinges, and security hardware	\N	\N	t	4	2026-04-06 13:20:54.53883+00	2026-04-06 13:20:54.53883+00
5	Boards & Plywood	boards-plywood	Plywood, MDF, particle board, and laminates	\N	\N	t	5	2026-04-06 13:20:54.53883+00	2026-04-06 13:20:54.53883+00
6	Electrical	electrical	Wires, cables, switches, MCBs, and electrical accessories	\N	\N	t	6	2026-04-06 13:20:54.53883+00	2026-04-06 13:20:54.53883+00
7	Plumbing	plumbing	Pipes, fittings, valves, and water storage solutions	\N	\N	t	7	2026-04-06 13:20:54.53883+00	2026-04-06 13:20:54.53883+00
8	Kitchen & Appliances	kitchen-appliances	Kitchen sinks, chimneys, hobs, and kitchen hardware	\N	\N	t	8	2026-04-06 13:20:54.53883+00	2026-04-06 13:20:54.53883+00
9	Cement & Building	cement-building	Cement, TMT bars, ready mix, and construction chemicals	\N	\N	t	9	2026-04-06 13:20:54.53883+00	2026-04-06 13:20:54.53883+00
10	Lighting	lighting	LED lights, panel lights, decorative lights, and outdoor lighting	\N	\N	t	10	2026-04-06 13:20:54.53883+00	2026-04-06 13:20:54.53883+00
11	Floor Tiles	floor-tiles	Vitrified, ceramic, and porcelain floor tiles	1	\N	t	1	2026-04-06 13:20:54.633416+00	2026-04-06 13:20:54.633416+00
12	Wall Tiles	wall-tiles	Ceramic and decorative wall tiles	1	\N	t	2	2026-04-06 13:20:54.633416+00	2026-04-06 13:20:54.633416+00
13	Vitrified Tiles	vitrified-tiles	Double charge and glazed vitrified tiles	1	\N	t	3	2026-04-06 13:20:54.633416+00	2026-04-06 13:20:54.633416+00
14	Outdoor Tiles	outdoor-tiles	Parking, pathway, and terrace tiles	1	\N	t	4	2026-04-06 13:20:54.633416+00	2026-04-06 13:20:54.633416+00
15	Mosaic Tiles	mosaic-tiles	Decorative mosaic and art tiles	1	\N	t	5	2026-04-06 13:20:54.633416+00	2026-04-06 13:20:54.633416+00
16	Interior Paints	interior-paints	Emulsion, distemper, and premium interior paints	2	\N	t	1	2026-04-06 13:20:54.723383+00	2026-04-06 13:20:54.723383+00
17	Exterior Paints	exterior-paints	Weather-proof and textured exterior paints	2	\N	t	2	2026-04-06 13:20:54.723383+00	2026-04-06 13:20:54.723383+00
18	Primers & Putty	primers-putty	Wall primers, putty, and surface preparation	2	\N	t	3	2026-04-06 13:20:54.723383+00	2026-04-06 13:20:54.723383+00
19	Wood Finishes	wood-finishes	Wood stains, varnishes, and PU finishes	2	\N	t	4	2026-04-06 13:20:54.723383+00	2026-04-06 13:20:54.723383+00
20	Waterproofing	waterproofing	Waterproofing solutions and coatings	2	\N	t	5	2026-04-06 13:20:54.723383+00	2026-04-06 13:20:54.723383+00
21	Toilets & WC	toilets-wc	Western toilets, wall-hung, and EWC	3	\N	t	1	2026-04-06 13:20:54.805887+00	2026-04-06 13:20:54.805887+00
22	Wash Basins	wash-basins	Counter-top, wall-mounted, and pedestal basins	3	\N	t	2	2026-04-06 13:20:54.805887+00	2026-04-06 13:20:54.805887+00
23	Faucets & Taps	faucets-taps	Basin taps, shower mixers, and kitchen taps	3	\N	t	3	2026-04-06 13:20:54.805887+00	2026-04-06 13:20:54.805887+00
24	Shower Systems	shower-systems	Rain showers, hand showers, and shower panels	3	\N	t	4	2026-04-06 13:20:54.805887+00	2026-04-06 13:20:54.805887+00
25	Bath Accessories	bath-accessories	Towel rods, soap holders, and bathroom fittings	3	\N	t	5	2026-04-06 13:20:54.805887+00	2026-04-06 13:20:54.805887+00
26	Door Locks	door-locks	Mortice locks, digital locks, and padlocks	4	\N	t	1	2026-04-06 13:20:54.881333+00	2026-04-06 13:20:54.881333+00
27	Door Handles	door-handles	Lever handles, pull handles, and knobs	4	\N	t	2	2026-04-06 13:20:54.881333+00	2026-04-06 13:20:54.881333+00
28	Hinges	hinges	Butt hinges, concealed hinges, and floor springs	4	\N	t	3	2026-04-06 13:20:54.881333+00	2026-04-06 13:20:54.881333+00
29	Cabinet Hardware	cabinet-hardware	Drawer slides, handles, and kitchen fittings	4	\N	t	4	2026-04-06 13:20:54.881333+00	2026-04-06 13:20:54.881333+00
30	Plywood	plywood	BWP, BWR, and commercial plywood	5	\N	t	1	2026-04-06 13:20:54.953919+00	2026-04-06 13:20:54.953919+00
31	MDF Board	mdf-board	Plain and pre-laminated MDF	5	\N	t	2	2026-04-06 13:20:54.953919+00	2026-04-06 13:20:54.953919+00
32	Particle Board	particle-board	Plain and pre-laminated particle board	5	\N	t	3	2026-04-06 13:20:54.953919+00	2026-04-06 13:20:54.953919+00
33	Laminates	laminates	Decorative laminates and HPL sheets	5	\N	t	4	2026-04-06 13:20:54.953919+00	2026-04-06 13:20:54.953919+00
34	Wires & Cables	wires-cables	House wires, flexible cables, and armored cables	6	\N	t	1	2026-04-06 13:20:55.038763+00	2026-04-06 13:20:55.038763+00
35	Switches & Sockets	switches-sockets	Modular switches, sockets, and switch plates	6	\N	t	2	2026-04-06 13:20:55.038763+00	2026-04-06 13:20:55.038763+00
36	MCB & Distribution	mcb-distribution	MCBs, RCCBs, and distribution boards	6	\N	t	3	2026-04-06 13:20:55.038763+00	2026-04-06 13:20:55.038763+00
37	Fans	fans	Ceiling fans, exhaust fans, and table fans	6	\N	t	4	2026-04-06 13:20:55.038763+00	2026-04-06 13:20:55.038763+00
38	CPVC Pipes	cpvc-pipes	Hot and cold water CPVC piping systems	7	\N	t	1	2026-04-06 13:20:55.121926+00	2026-04-06 13:20:55.121926+00
39	PVC Pipes	pvc-pipes	SWR, drainage, and agricultural PVC pipes	7	\N	t	2	2026-04-06 13:20:55.121926+00	2026-04-06 13:20:55.121926+00
40	Pipe Fittings	pipe-fittings	Elbows, tees, couplers, and valves	7	\N	t	3	2026-04-06 13:20:55.121926+00	2026-04-06 13:20:55.121926+00
41	Water Tanks	water-tanks	Overhead and underground water storage tanks	7	\N	t	4	2026-04-06 13:20:55.121926+00	2026-04-06 13:20:55.121926+00
42	Kitchen Sinks	kitchen-sinks	Stainless steel, granite, and quartz kitchen sinks	8	\N	t	1	2026-04-06 13:20:55.203944+00	2026-04-06 13:20:55.203944+00
43	Chimneys	chimneys	Auto-clean, baffle filter, and island chimneys	8	\N	t	2	2026-04-06 13:20:55.203944+00	2026-04-06 13:20:55.203944+00
44	Hobs & Cooktops	hobs-cooktops	Built-in gas hobs and induction cooktops	8	\N	t	3	2026-04-06 13:20:55.203944+00	2026-04-06 13:20:55.203944+00
45	OPC Cement	opc-cement	Ordinary Portland Cement 43 & 53 grade	9	\N	t	1	2026-04-06 13:20:55.276318+00	2026-04-06 13:20:55.276318+00
46	PPC Cement	ppc-cement	Portland Pozzolana Cement	9	\N	t	2	2026-04-06 13:20:55.276318+00	2026-04-06 13:20:55.276318+00
47	TMT Bars	tmt-bars	Fe500 and Fe500D TMT reinforcement bars	9	\N	t	3	2026-04-06 13:20:55.276318+00	2026-04-06 13:20:55.276318+00
48	LED Bulbs	led-bulbs	LED bulbs and tube lights	10	\N	t	1	2026-04-06 13:20:55.352837+00	2026-04-06 13:20:55.352837+00
49	Panel Lights	panel-lights	Slim and surface mount LED panel lights	10	\N	t	2	2026-04-06 13:20:55.352837+00	2026-04-06 13:20:55.352837+00
50	Decorative Lights	decorative-lights	Chandeliers, pendants, and wall lights	10	\N	t	3	2026-04-06 13:20:55.352837+00	2026-04-06 13:20:55.352837+00
51	Outdoor Lights	outdoor-lights	Flood lights, bollard lights, and garden lights	10	\N	t	4	2026-04-06 13:20:55.352837+00	2026-04-06 13:20:55.352837+00
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coupons (id, code, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, used_count, is_active, valid_from, valid_until, created_at, updated_at) FROM stdin;
1	WELCOME10	10% off on your first order	percentage	10.00	1000.00	2000.00	\N	0	t	2026-04-06 13:20:54.336078+00	\N	2026-04-06 13:20:54.336078+00	2026-04-06 13:20:54.336078+00
2	FLAT500	Flat â‚¹500 off on orders above â‚¹5,000	fixed	500.00	5000.00	\N	\N	0	t	2026-04-06 13:20:54.336078+00	\N	2026-04-06 13:20:54.336078+00	2026-04-06 13:20:54.336078+00
3	BULK15	15% off on bulk orders above â‚¹25,000	percentage	15.00	25000.00	5000.00	\N	0	t	2026-04-06 13:20:54.336078+00	\N	2026-04-06 13:20:54.336078+00	2026-04-06 13:20:54.336078+00
4	SAVE200	Flat â‚¹200 off on any order	fixed	200.00	500.00	\N	1000	0	t	2026-04-06 13:20:54.336078+00	\N	2026-04-06 13:20:54.336078+00	2026-04-06 13:20:54.336078+00
\.


--
-- Data for Name: dealers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dealers (id, user_id, company_name, contact_name, email, phone, gstin, address, city, state, pincode, zone_id, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory (id, product_id, reorder_level, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: inventory_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_transactions (id, product_id, transaction_type, quantity_change, quantity_before, quantity_after, reason, reference_type, reference_id, created_by, created_at) FROM stdin;
1	20	reduce	-2	200	198	Order 1 — 2 from stock	order	1	7e5d1974-b943-47bf-843d-e7050cdf5b8a	2026-04-06 13:31:14.540372+00
2	32	reduce	-5	400	395	Order 1 — 5 from stock	order	1	7e5d1974-b943-47bf-843d-e7050cdf5b8a	2026-04-06 13:31:14.540372+00
3	26	reduce	-12	200	188	Order 1 — 12 from stock	order	1	7e5d1974-b943-47bf-843d-e7050cdf5b8a	2026-04-06 13:31:14.540372+00
4	1	reduce	-100	5000	4900	Order 1 — 100 from stock	order	1	7e5d1974-b943-47bf-843d-e7050cdf5b8a	2026-04-06 13:31:14.540372+00
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, product_id, quantity, unit_price, total_price, fulfillment_status, quantity_back_order, created_at) FROM stdin;
1	1	20	2	850.00	1700.00	in_stock	0	2026-04-06 13:31:14.540372+00
2	1	32	5	2950.00	14750.00	in_stock	0	2026-04-06 13:31:14.540372+00
3	1	26	12	4200.00	50400.00	in_stock	0	2026-04-06 13:31:14.540372+00
4	1	1	100	45.00	4500.00	in_stock	0	2026-04-06 13:31:14.540372+00
\.


--
-- Data for Name: order_status_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_status_history (id, order_id, from_status, to_status, changed_by, notes, created_at) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, order_number, buyer_id, dealer_id, vendor_id, status, payment_method, payment_status, total_amount, shipping_address, notes, expected_delivery_date, created_at, updated_at) FROM stdin;
1	ORD-0000001	1	\N	\N	pending	cod	unpaid	71350.00	Viviya Roshan Wadkar, 45A/67, Start building, , JSS Road, Marine Lines, Mumbai, MH - 400002, Phone: 9876543210	Coupon: BULK15 (-₹5000)	2026-04-09	2026-04-06 13:31:14.540372+00	2026-04-06 13:31:14.540372+00
\.


--
-- Data for Name: pricing_tiers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pricing_tiers (id, product_id, min_qty, max_qty, price_per_unit, label, sort_order, created_at, updated_at) FROM stdin;
1	8	1	5	5850.00	Base Price	0	2026-04-08 08:53:16.980968+00	2026-04-08 08:53:16.980968+00
2	8	6	20	5500.00	Bulk Price	1	2026-04-08 08:53:16.980968+00	2026-04-08 08:53:16.980968+00
3	8	21	\N	5000.00	Wholesale	2	2026-04-08 08:53:16.980968+00	2026-04-08 08:53:16.980968+00
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, slug, description, sku, hsn_code, isin, category_id, brand_id, brand_collection, vendor_id, unit, price, mrp, stock_qty, min_order_qty, image_url, images, specifications, length_mm, breadth_mm, width_mm, thickness_mm, weight_kg, box_length_mm, box_breadth_mm, box_width_mm, box_weight_kg, colour, grade, material, calibration, certification, termite_resistance, warranty, country_of_origin, customer_care_details, tech_sheet_url, manufactured_by, packaged_by, lead_time_days, is_active, created_at, updated_at) FROM stdin;
2	GVT Digital Print Wood Plank 200x1200mm - Autumn Oak	kajaria-gvt-wood-autumn-oak	Wood-look glazed vitrified tile with realistic oak texture. Anti-skid surface, ideal for modern interiors.	KAJ-GVT-AO-1200	6907	\N	11	1	\N	\N	sq.ft	72.00	85.00	3000	50	\N	[]	{}	200.00	1200.00	\N	10.00	2.100	\N	\N	\N	\N	Autumn Oak	Premium	Vitrified	\N	\N	\N	5 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
3	Matt Finish Ceramic Wall Tile 300x600mm - Ivory	somany-ceramic-wall-ivory	Smooth matt finish ceramic wall tile in ivory shade. Perfect for kitchen and bathroom walls. Easy to clean and maintain.	SOM-CWT-IV-3060	6908	\N	12	2	\N	\N	sq.ft	32.00	40.00	8000	100	\N	[]	{}	300.00	600.00	\N	8.00	1.200	\N	\N	\N	\N	Ivory	Standard	Ceramic	\N	\N	\N	3 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
11	Damp Block Waterproofing Solution - 20 Kg	asian-paints-dampblock-20kg	Acrylic-based flexible waterproofing coating for terraces, external walls, and bathrooms. Bridges hairline cracks.	AP-DMP-WP-20KG	3214	\N	20	3	\N	\N	bucket	3200.00	3800.00	150	1	\N	[]	{}	\N	\N	\N	\N	20.000	\N	\N	\N	\N	Grey	\N	Acrylic Polymer	\N	\N	\N	5 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
12	Wall Primer Water Based - 20 Litre	berger-primer-wb-20l	Water-based wall primer for interior surfaces. Provides excellent adhesion for topcoats and ensures uniform paint finish.	BRG-PRM-WB-20L	3209	\N	18	4	\N	\N	bucket	1850.00	2200.00	400	1	\N	[]	{}	\N	\N	\N	\N	26.000	\N	\N	\N	\N	White	\N	Acrylic	\N	\N	\N	\N	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
13	Silk Glamor Interior Emulsion - 10 Litre	berger-silk-glamor-10l	Premium interior emulsion with silk sheen finish. Stain-proof and washable. Low VOC formula for healthy interiors.	BRG-SLK-INT-10L	3209	\N	16	4	\N	\N	bucket	3200.00	3800.00	180	1	\N	[]	{}	\N	\N	\N	\N	14.000	\N	\N	\N	\N	White	Premium	Acrylic Emulsion	\N	\N	\N	5 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
14	Melamyne Wood Finish - 4 Litre	asian-paints-melamyne-4l	High gloss melamine wood finish for furniture and doors. Crystal clear transparent coating that enhances wood grain.	AP-MLM-WF-4L	3208	\N	19	3	\N	\N	piece	1450.00	1700.00	120	1	\N	[]	{}	\N	\N	\N	\N	5.500	\N	\N	\N	\N	Clear	\N	Melamine	\N	\N	\N	\N	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
15	Enigma One-Piece Rimless Toilet with Soft Close Seat	hindware-enigma-toilet	Premium one-piece rimless toilet with S-trap. Dual flush (3L/6L), soft close seat, and anti-bacterial glaze. Easy-clean design with concealed trapway.	HW-ENG-TP-01	6910	\N	21	5	\N	\N	piece	12500.00	15000.00	50	1	\N	[]	{}	700.00	370.00	\N	\N	35.000	\N	\N	\N	\N	Star White	Premium	Ceramic	\N	\N	\N	10 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
16	EWC Wall Hung Toilet with Frame	cera-ewc-wallhung	Modern wall-hung EWC with concealed cistern frame. Space-saving design with dual flush and soft close seat.	CERA-WH-EWC-01	6910	\N	21	6	\N	\N	piece	8900.00	11000.00	35	1	\N	[]	{}	540.00	360.00	\N	\N	25.000	\N	\N	\N	\N	Snow White	Premium	Ceramic	\N	\N	\N	7 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
17	Counter-Top Art Basin 600mm - Round	hindware-art-basin-round	Designer counter-top art basin with rounded edges. Premium ceramic with anti-stain glaze. Includes waste coupling.	HW-CTB-RND-600	6910	\N	22	5	\N	\N	piece	4500.00	5500.00	80	1	\N	[]	{}	600.00	420.00	\N	\N	12.000	\N	\N	\N	\N	White	Premium	Ceramic	\N	\N	\N	5 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
18	Single Lever Basin Mixer - Chrome	jaquar-basin-mixer-chrome	Premium single lever basin mixer with ceramic cartridge. Quarter-turn operation with hot and cold mixing. Chrome plated brass body.	JAQ-BM-CHR-01	8481	\N	23	17	\N	\N	piece	3800.00	4600.00	120	1	\N	[]	{}	\N	\N	\N	\N	1.200	\N	\N	\N	\N	Chrome	Premium	Brass Chrome	\N	\N	\N	7 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
19	Overhead Rain Shower 200mm with Arm	jaquar-rain-shower-200	200mm round rain shower head with 450mm shower arm. Full stainless steel construction with anti-lime system.	JAQ-RS-200-ARM	8481	\N	24	17	\N	\N	piece	5200.00	6500.00	60	1	\N	[]	{}	200.00	200.00	\N	\N	1.500	\N	\N	\N	\N	Chrome	Premium	Stainless Steel	\N	\N	\N	5 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
21	7 Lever Deadbolt Door Lock - Satin Steel	godrej-7lever-deadbolt	7-lever double action deadbolt lock with anti-pick pins. Hardened steel body with satin nickel finish. Comes with 3 computerized keys.	GDJ-7LV-DB-SS	8301	\N	26	7	\N	\N	piece	2350.00	2800.00	150	1	\N	[]	{}	\N	\N	\N	\N	0.800	\N	\N	\N	\N	Satin Steel	Premium	Stainless Steel	\N	\N	\N	10 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
22	Digital Smart Lock - Fingerprint & Pin	godrej-smart-lock-fp	Smart digital door lock with fingerprint, PIN, RFID card, and emergency key access. Auto-lock feature with audit trail.	GDJ-SML-FP-01	8301	\N	26	7	\N	\N	piece	12500.00	15000.00	30	1	\N	[]	{}	\N	\N	\N	\N	3.200	\N	\N	\N	\N	Black	Premium	Zinc Alloy	\N	\N	\N	2 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
8	Royale Luxury Emulsion Interior Paint - 20 Litre	asian-paints-royale-20l	Premium luxury emulsion paint with Teflon surface protector. Stain-resistant, washable finish with silk-like sheen. Coverage: 120-140 sq.ft per litre.	AP-RYL-INT-20L	3209	\N	16	3	\N	\N	bucket	5850.00	6500.00	200	1	\N	[]	{}	\N	\N	\N	\N	28.000	\N	\N	\N	\N	White	Premium	Acrylic Emulsion	\N	\N	\N	5 years	India	\N	\N	MaterialKing	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-21 06:21:23.087262+00
4	Digital HD Print Wall Tile 300x450mm - Marble Brown	somany-hd-wall-marble-brown	High-definition digital print wall tile with natural marble brown pattern. Moisture resistant and hygienic.	SOM-HDW-MB-3045	6908	\N	12	2	\N	\N	sq.ft	28.00	35.00	6000	100	\N	[]	{}	300.00	450.00	\N	7.50	1.000	\N	\N	\N	\N	Marble Brown	Standard	Ceramic	\N	\N	\N	3 years	India	\N	\N	\N	\N	\N	f	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
5	Anti-Skid Parking Tile 300x300mm - Dark Grey	kajaria-parking-dark-grey	Heavy duty anti-skid parking tile with 12mm thickness. Suitable for car parkings, driveways, and industrial areas.	KAJ-PKG-DG-300	6907	\N	14	1	\N	\N	sq.ft	38.00	48.00	4000	100	\N	[]	{}	300.00	300.00	\N	12.00	2.500	\N	\N	\N	\N	Dark Grey	Heavy Duty	Vitrified	\N	\N	\N	10 years	India	\N	\N	\N	\N	\N	f	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
6	Hexagonal Mosaic Tile Sheet - Carrara White	rak-mosaic-hex-carrara	Premium hexagonal mosaic tile on mesh backing. Perfect for bathroom floors, feature walls, and kitchen backsplashes.	RAK-MOS-HX-CW	6907	\N	15	16	\N	\N	sq.ft	120.00	150.00	1500	20	\N	[]	{}	300.00	300.00	\N	6.00	0.800	\N	\N	\N	\N	Carrara White	Premium	Porcelain	\N	\N	\N	5 years	India	\N	\N	\N	\N	\N	f	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
7	Double Charge Vitrified Tile 800x800mm - Bottochino	kajaria-dc-800-bottochino	Large format double charge vitrified tile with Bottochino marble effect. Full body color for long-lasting beauty.	KAJ-DC-BOT-800	6907	\N	13	1	\N	\N	sq.ft	65.00	78.00	3500	50	\N	[]	{}	800.00	800.00	\N	10.00	3.200	\N	\N	\N	\N	Bottochino	Premium	Vitrified	\N	\N	\N	10 years	India	\N	\N	\N	\N	\N	f	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
9	Apex Ultima Exterior Emulsion - 20 Litre	asian-paints-apex-ultima-20l	Weather-proof exterior emulsion with anti-algal technology. UV resistant with dust-proof finish. Coverage: 90-110 sq.ft per litre.	AP-APX-EXT-20L	3209	\N	17	3	\N	\N	bucket	4850.00	5700.00	300	1	\N	[]	{}	\N	\N	\N	\N	30.000	\N	\N	\N	\N	White	Premium	Acrylic Emulsion	\N	\N	\N	7 years	India	\N	\N	\N	\N	\N	f	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
10	WeatherCoat All Guard Exterior Paint - 10 Litre	berger-weathercoat-10l	All-weather exterior paint with anti-fungal and anti-algal properties. Excellent color retention and durability.	BRG-WCT-EXT-10L	3209	\N	17	4	\N	\N	bucket	2950.00	3400.00	250	1	\N	[]	{}	\N	\N	\N	\N	15.000	\N	\N	\N	\N	White	Standard	Acrylic Emulsion	\N	\N	\N	5 years	India	\N	\N	\N	\N	\N	f	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
23	Premium Mortise Handle Set - Rose Gold	godrej-mortise-rosegold	Premium zinc alloy mortise handle with rose gold PVD finish. Elegant design suitable for main doors and bedrooms.	GDJ-MH-RG-01	8302	\N	27	7	\N	\N	piece	1850.00	2200.00	100	1	\N	[]	{}	\N	\N	\N	\N	1.000	\N	\N	\N	\N	Rose Gold	Premium	Zinc Alloy	\N	\N	\N	5 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
24	Concealed Hinge Soft Close - Pair	godrej-hinge-softclose	Full overlay concealed hinge with hydraulic soft-close mechanism. 110Â° opening angle, clip-on mounting. Sold as pair.	GDJ-HNG-SC-PR	8302	\N	28	7	\N	\N	piece	280.00	350.00	500	10	\N	[]	{}	\N	\N	\N	\N	0.300	\N	\N	\N	\N	Nickel	Standard	Cold Rolled Steel	\N	\N	\N	3 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
25	Telescopic Drawer Slide 18 Inch - Pair	godrej-drawer-slide-18	Ball bearing telescopic drawer slide with 45kg load capacity. Full extension with smooth glide operation. 18-inch length, sold as pair.	GDJ-DS-18-PR	8302	\N	29	7	\N	\N	piece	420.00	520.00	300	5	\N	[]	{}	\N	\N	\N	\N	0.600	\N	\N	\N	\N	Zinc	Standard	Cold Rolled Steel	\N	\N	\N	3 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
27	19mm BWR Commercial Plywood 8x4 ft	greenply-bwr-19mm-8x4	19mm boiling water resistant plywood for interior furniture, wardrobes, and false ceilings. IS:303 certified.	GRP-BWR-19-8X4	4412	\N	30	11	\N	\N	piece	2800.00	3200.00	300	1	\N	[]	{}	2440.00	1220.00	\N	19.00	26.000	\N	\N	\N	\N	Natural	BWR	Hardwood	\N	\N	\N	15 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
28	Pre-Laminated MDF 18mm White - 8x4 ft	century-mdf-18mm-white	Pre-laminated MDF board with white matt finish on both sides. Ideal for modular furniture, shelving, and partitions.	CEN-MDF-18-WH	4411	\N	31	10	\N	\N	piece	2200.00	2600.00	150	1	\N	[]	{}	2440.00	1220.00	\N	18.00	32.000	\N	\N	\N	\N	White	E1 Grade	MDF	\N	\N	\N	\N	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
29	Pre-Laminated Particle Board 16mm - 8x4 ft	greenply-pb-16mm	16mm pre-laminated particle board for budget furniture and office partitions. Available in multiple finishes.	GRP-PB-16-8X4	4410	\N	32	11	\N	\N	piece	1100.00	1350.00	250	1	\N	[]	{}	2440.00	1220.00	\N	16.00	30.000	\N	\N	\N	\N	Walnut	Standard	Particle Board	\N	\N	\N	\N	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
30	High Pressure Decorative Laminate 1mm - 8x4 ft	century-hpl-1mm	1mm thick high-pressure decorative laminate sheet. Scratch resistant, heat resistant surface. Available in 200+ designs.	CEN-HPL-1MM-8X4	4823	\N	33	10	\N	\N	piece	950.00	1200.00	400	5	\N	[]	{}	2440.00	1220.00	\N	1.00	4.000	\N	\N	\N	\N	Teak	Premium	HPL	\N	\N	\N	\N	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
31	Lifeline Plus FR House Wire 1.5 sq mm - 90m Coil	havells-lifeline-1.5-90m	1.5 sq mm single core PVC insulated copper house wire. Flame retardant (FR), 90-metre coil. IS:694 certified.	HAV-LLP-15-90M	8544	\N	34	8	\N	\N	roll	1850.00	2200.00	500	1	\N	[]	{}	\N	\N	\N	\N	2.800	\N	\N	\N	\N	Red	FR	Copper PVC	\N	\N	\N	10 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
33	Roma Modular Switch 6A - Pack of 20	anchor-roma-switch-6a	Roma series 1-way modular switch 6A 250V. Durable polycarbonate construction with silver oxide contacts. Pack of 20 switches.	ANC-ROM-SW-6A	8536	\N	35	18	\N	\N	piece	680.00	800.00	1000	10	\N	[]	{}	\N	\N	\N	\N	0.400	\N	\N	\N	\N	White	\N	Polycarbonate	\N	\N	\N	3 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
34	63A SP MCB C-Curve	havells-mcb-63a-sp	63-amp single pole miniature circuit breaker, C-curve. 10kA breaking capacity, DIN rail mounting. IS/IEC 60898 certified.	HAV-MCB-63A-SP	8536	\N	36	8	\N	\N	piece	520.00	650.00	300	1	\N	[]	{}	\N	\N	\N	\N	0.200	\N	\N	\N	\N	Grey	\N	Thermoplastic	\N	\N	\N	2 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
35	ES 48 Ceiling Fan 1200mm - Brown	crompton-es48-fan-1200	1200mm (48 inch) energy-saving ceiling fan with high air delivery. Powder coated finish with double ball bearings for silent operation.	CRM-ES48-1200-BR	8414	\N	37	14	\N	\N	piece	1650.00	2000.00	100	1	\N	[]	{}	\N	\N	\N	\N	4.500	\N	\N	\N	\N	Brown	\N	Steel & Aluminium	\N	\N	\N	2 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
36	FR House Wire 1.0 sq mm - 90m Coil	polycab-fr-1.0-90m	1.0 sq mm single core flame retardant copper wire. 90-metre coil. Ideal for lighting circuits.	PLY-FR-10-90M	8544	\N	34	15	\N	\N	roll	1450.00	1700.00	600	1	\N	[]	{}	\N	\N	\N	\N	2.000	\N	\N	\N	\N	Green	FR	Copper PVC	\N	\N	\N	10 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
37	CPVC Pro Pipe 15mm (1/2") - 3m Length	astral-cpvc-15mm-3m	15mm CPVC hot and cold water pipe, 3-metre length. SDR-11 rated for up to 93Â°C. Lead-free and corrosion resistant.	AST-CPVC-15-3M	3917	\N	38	19	\N	\N	piece	165.00	200.00	2000	10	\N	[]	{}	\N	\N	\N	\N	0.300	\N	\N	\N	\N	Light Yellow	\N	CPVC	\N	\N	\N	25 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
38	SWR Drainage Pipe 110mm - 3m Length	supreme-swr-110mm-3m	110mm soil, waste, and rainwater PVC pipe. 3-metre length. Self-extinguishing, UV stabilized. IS:13592 certified.	SUP-SWR-110-3M	3917	\N	39	20	\N	\N	piece	480.00	580.00	800	5	\N	[]	{}	\N	\N	\N	\N	2.800	\N	\N	\N	\N	Grey	\N	PVC	\N	\N	\N	10 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
39	CPVC Elbow 15mm 90Â° - Pack of 25	astral-cpvc-elbow-15mm	15mm CPVC 90-degree elbow fitting. Solvent cement jointing. Pack of 25 pieces for plumbing installations.	AST-CPV-ELB-15	3917	\N	40	19	\N	\N	piece	450.00	550.00	1500	25	\N	[]	{}	\N	\N	\N	\N	0.800	\N	\N	\N	\N	Light Yellow	\N	CPVC	\N	\N	\N	25 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
40	Triple Layer Water Tank 1000 Litre	supreme-water-tank-1000l	1000-litre triple layer overhead water tank. UV stabilized outer layer, food-grade inner layer. Anti-bacterial protection.	SUP-WT-1000L	3925	\N	41	20	\N	\N	piece	5800.00	6800.00	50	1	\N	[]	{}	\N	\N	\N	\N	18.000	\N	\N	\N	\N	White	\N	LLDPE	\N	\N	\N	5 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
41	UPVC Plumbing Pipe 25mm - 6m Length	astral-upvc-25mm-6m	25mm UPVC pressure pipe for cold water supply. 6-metre length. Solvent cement jointing. IS:4985 certified.	AST-UPVC-25-6M	3917	\N	39	19	\N	\N	piece	220.00	280.00	1200	10	\N	[]	{}	\N	\N	\N	\N	1.200	\N	\N	\N	\N	Blue	\N	UPVC	\N	\N	\N	25 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
42	Double Bowl Stainless Steel Kitchen Sink 37x18 Inch	hindware-double-sink-37x18	37x18 inch double bowl kitchen sink in 304 grade stainless steel. 1mm sheet thickness with satin finish. Includes waste coupling and drainer.	HW-KS-DB-3718	7324	\N	42	5	\N	\N	piece	6500.00	7800.00	40	1	\N	[]	{}	940.00	460.00	\N	\N	8.000	\N	\N	\N	\N	Satin	Premium	Stainless Steel 304	\N	\N	\N	10 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
43	Auto Clean Chimney 90cm - 1200 mÂ³/hr	hindware-chimney-autocl-90	90cm auto-clean kitchen chimney with 1200 mÂ³/hr suction capacity. Baffle filter, LED lights, and touch control panel.	HW-CH-AC-90	8414	\N	43	5	\N	\N	piece	14500.00	18000.00	25	1	\N	[]	{}	900.00	480.00	\N	480.00	18.000	\N	\N	\N	\N	Black	Premium	Stainless Steel	\N	\N	\N	5 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
44	Built-in 4 Burner Gas Hob - Toughened Glass	hindware-hob-4b-glass	Built-in 4-burner gas hob with toughened glass top. Auto ignition with flame failure device. Heavy duty pan supports.	HW-HOB-4B-TG	7321	\N	44	5	\N	\N	piece	8500.00	10500.00	30	1	\N	[]	{}	600.00	520.00	\N	\N	10.000	\N	\N	\N	\N	Black	Premium	Toughened Glass	\N	\N	\N	2 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
45	UltraTech OPC 53 Grade Cement - 50 Kg Bag	ultratech-opc-53-50kg	OPC 53 grade cement for high strength concrete, RCC work, and precast elements. IS:12269 certified. Consistent quality with superior strength.	UTC-OPC-53-50KG	2523	\N	45	12	\N	\N	bag	380.00	420.00	10000	50	\N	[]	{}	\N	\N	\N	\N	50.000	\N	\N	\N	\N	Grey	53 Grade	OPC	\N	\N	\N	\N	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
46	ACC Gold PPC Cement - 50 Kg Bag	acc-ppc-gold-50kg	Portland Pozzolana Cement with superior workability. Ideal for all general construction, plastering, and masonry work. IS:1489 certified.	ACC-PPC-GLD-50KG	2523	\N	46	13	\N	\N	bag	360.00	400.00	8000	50	\N	[]	{}	\N	\N	\N	\N	50.000	\N	\N	\N	\N	Grey	PPC	PPC	\N	\N	\N	\N	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
47	UltraTech PPC Cement - 50 Kg Bag	ultratech-ppc-50kg	Premium Portland Pozzolana Cement for general construction. Excellent for plastering, flooring, and masonry. Lower heat of hydration.	UTC-PPC-50KG	2523	\N	46	12	\N	\N	bag	370.00	410.00	9000	50	\N	[]	{}	\N	\N	\N	\N	50.000	\N	\N	\N	\N	Grey	PPC	PPC	\N	\N	\N	\N	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
48	Fe500D TMT Bar 12mm - Per Kg	ultratech-tmt-12mm	Fe500D grade TMT reinforcement bar, 12mm diameter. Superior ductility and weldability. BIS certified, earthquake resistant.	UTC-TMT-12MM-KG	7214	\N	47	12	\N	\N	kg	62.00	70.00	50000	100	\N	[]	{}	\N	\N	\N	\N	1.000	\N	\N	\N	\N	\N	Fe500D	Steel	\N	\N	\N	\N	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
49	ACC Concrete Plus PPC - 50 Kg Bag	acc-concrete-plus-50kg	Premium PPC cement with superior concrete performance. Enhanced workability and durability for structural applications.	ACC-CP-50KG	2523	\N	46	13	\N	\N	bag	385.00	430.00	5000	50	\N	[]	{}	\N	\N	\N	\N	50.000	\N	\N	\N	\N	Grey	PPC	PPC	\N	\N	\N	\N	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
50	LED Bulb 12W B22 Cool Day Light - Pack of 10	havells-led-12w-b22-10pk	12-watt LED bulb with B22 base. 1200 lumens, cool daylight 6500K. Energy-efficient with 25,000 hours lifespan. Pack of 10.	HAV-LED-12W-B22	9405	\N	48	8	\N	\N	piece	850.00	1100.00	500	1	\N	[]	{}	\N	\N	\N	\N	0.800	\N	\N	\N	\N	White	\N	Polycarbonate	\N	\N	\N	2 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
51	LED Slim Panel Light 18W Round - Surface Mount	crompton-panel-18w-round	18W surface mount round LED panel light. 1500 lumens, cool white 6000K. Slim profile 22mm, 225mm diameter. No false ceiling needed.	CRM-PNL-18W-RND	9405	\N	49	14	\N	\N	piece	480.00	600.00	200	1	\N	[]	{}	\N	\N	\N	\N	0.500	\N	\N	\N	\N	White	\N	Aluminium Die-Cast	\N	\N	\N	2 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
52	Decorative Pendant Light - Modern Globe	havells-pendant-globe	Modern globe pendant light with frosted glass shade. E27 base (bulb not included). Adjustable cord length up to 1.5m.	HAV-DPL-GLB-01	9405	\N	50	8	\N	\N	piece	2800.00	3500.00	40	1	\N	[]	{}	\N	\N	\N	\N	2.000	\N	\N	\N	\N	Black Gold	\N	Glass & Metal	\N	\N	\N	1 year	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
53	30W LED Flood Light - IP65 Outdoor	havells-flood-30w	30W LED flood light with IP65 rating for outdoor use. 3000 lumens, cool daylight. Die-cast aluminium body with tempered glass.	HAV-FLD-30W-IP65	9405	\N	51	8	\N	\N	piece	950.00	1200.00	150	1	\N	[]	{}	\N	\N	\N	\N	1.000	\N	\N	\N	\N	Grey	\N	Aluminium Die-Cast	\N	\N	\N	2 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
54	LED Tube Light T5 22W 4ft - Pack of 6	crompton-tubelight-t5-22w	22W T5 LED tube light, 4-feet length. 2200 lumens with diffused light. Direct replacement for conventional tube lights. Pack of 6.	CRM-TL-T5-22W-6	9405	\N	48	14	\N	\N	piece	1650.00	2000.00	300	1	\N	[]	{}	\N	\N	\N	\N	1.200	\N	\N	\N	\N	White	\N	Polycarbonate	\N	\N	\N	2 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:20:55.434191+00
20	Towel Rod 24 Inch - Stainless Steel	hindware-towel-rod-24	24-inch stainless steel towel rod with concealed mounting. Rust-proof and scratch-resistant finish.	HW-TR-SS-24	7324	\N	25	5	\N	\N	piece	850.00	1100.00	198	1	\N	[]	{}	600.00	\N	\N	\N	0.500	\N	\N	\N	\N	Chrome	Standard	Stainless Steel 304	\N	\N	\N	3 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:31:14.540372+00
32	Lifeline Plus FR Wire 2.5 sq mm - 90m Coil	havells-lifeline-2.5-90m	2.5 sq mm single core copper wire. Flame retardant PVC insulation, 90-metre coil. Ideal for power circuits and sockets.	HAV-LLP-25-90M	8544	\N	34	8	\N	\N	roll	2950.00	3500.00	395	1	\N	[]	{}	\N	\N	\N	\N	4.200	\N	\N	\N	\N	Blue	FR	Copper PVC	\N	\N	\N	10 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:31:14.540372+00
26	18mm BWP Marine Plywood 8x4 ft	century-bwp-18mm-8x4	18mm boiling water proof marine grade plywood. IS:710 certified. Suitable for kitchen cabinets, bathrooms, and exterior furniture.	CEN-BWP-18-8X4	4412	\N	30	10	\N	\N	piece	4200.00	4800.00	188	1	\N	[]	{}	2440.00	1220.00	\N	18.00	28.000	\N	\N	\N	\N	Natural	BWP Marine	Hardwood	\N	\N	\N	25 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:31:14.540372+00
1	Polished Vitrified Floor Tile 600x600mm - Marble White	kajaria-pvt-600-marble-white	Premium double-charged polished vitrified tile with marble white finish. Ideal for living rooms, bedrooms, and commercial spaces. High gloss finish with excellent stain resistance.	KAJ-VIT-MW-600	6907	\N	11	1	\N	\N	sq.ft	45.00	53.00	4900	100	\N	[]	{}	600.00	600.00	\N	9.50	1.800	\N	\N	\N	\N	Marble White	Premium	Vitrified	\N	\N	\N	5 years	India	\N	\N	\N	\N	\N	t	2026-04-06 13:20:55.434191+00	2026-04-06 13:31:14.540372+00
55	TRIAL 123	trial-123	trial abc123	trial abc	\N	\N	50	7	\N	\N	piece	100.00	200.00	50	1	\N	[]	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	India	\N	\N	\N	\N	\N	t	2026-04-10 12:06:00.247652+00	2026-04-10 12:06:00.247652+00
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_roles (id, user_id, role, is_active, created_at) FROM stdin;
1	7e5d1974-b943-47bf-843d-e7050cdf5b8a	buyer_admin	t	2026-04-06 13:25:38.649371+00
2	7ac8120e-6d82-4243-b703-822af1b20d08	admin	t	2026-04-06 14:01:55.326107+00
3	f897a92f-38fe-4bfa-a7d7-17cc905776c2	admin	t	2026-04-06 14:01:55.326107+00
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_sessions (id, user_id, refresh_token, expires_at, created_at) FROM stdin;
1	7e5d1974-b943-47bf-843d-e7050cdf5b8a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3ZTVkMTk3NC1iOTQzLTQ3YmYtODQzZC1lNzA1MGNkZjViOGEiLCJpYXQiOjE3NzU0ODE5MzgsImV4cCI6MTc3NjA4NjczOH0.OKw7KqO1RJd50eebCnYLsYBCP3crsJpujObuAQFvIy4	2026-04-13 13:25:38.659564+00	2026-04-06 13:25:38.659564+00
2	7e5d1974-b943-47bf-843d-e7050cdf5b8a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3ZTVkMTk3NC1iOTQzLTQ3YmYtODQzZC1lNzA1MGNkZjViOGEiLCJpYXQiOjE3NzU0ODE5NTUsImV4cCI6MTc3NjA4Njc1NX0.4uoVObJf67CQ3OkBuLVUJBSVQbp7Rng0wzAroz5mQDQ	2026-04-13 13:25:55.556398+00	2026-04-06 13:25:55.556398+00
3	7ac8120e-6d82-4243-b703-822af1b20d08	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3YWM4MTIwZS02ZDgyLTQyNDMtYjcwMy04MjJhZjFiMjBkMDgiLCJpYXQiOjE3NzU0ODQyMDEsImV4cCI6MTc3NjA4OTAwMX0.rKHqhEMpiamQ0T9ZWnmNjiAigUgExtw52KDwuakbyBI	2026-04-13 14:03:21.534723+00	2026-04-06 14:03:21.534723+00
4	f897a92f-38fe-4bfa-a7d7-17cc905776c2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmODk3YTkyZi0zOGZlLTRiZmEtYTdkNy0xN2NjOTA1Nzc2YzIiLCJpYXQiOjE3NzU0ODQyNDYsImV4cCI6MTc3NjA4OTA0Nn0.EENYwW18Jjm7kg6bXzTKo-IspSaogOIMir60GkqfAW0	2026-04-13 14:04:06.842936+00	2026-04-06 14:04:06.842936+00
5	f897a92f-38fe-4bfa-a7d7-17cc905776c2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmODk3YTkyZi0zOGZlLTRiZmEtYTdkNy0xN2NjOTA1Nzc2YzIiLCJpYXQiOjE3NzU4MjI2MzYsImV4cCI6MTc3NjQyNzQzNn0.Y_HBsqQWbUt4y-Xj1pHv2PFYTwMMMPQJXJhiXmEAe0k	2026-04-17 12:03:56.779818+00	2026-04-10 12:03:56.779818+00
6	f897a92f-38fe-4bfa-a7d7-17cc905776c2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmODk3YTkyZi0zOGZlLTRiZmEtYTdkNy0xN2NjOTA1Nzc2YzIiLCJpYXQiOjE3NzY2ODE4MTQsImV4cCI6MTc3NzI4NjYxNH0.4484ASEYuuXSu7eiPUw6a-hnEfRrBmiPeBNY2L5MPj8	2026-04-27 10:43:34.340851+00	2026-04-20 10:43:34.340851+00
7	f897a92f-38fe-4bfa-a7d7-17cc905776c2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmODk3YTkyZi0zOGZlLTRiZmEtYTdkNy0xN2NjOTA1Nzc2YzIiLCJpYXQiOjE3NzY2ODg5MjksImV4cCI6MTc3NzI5MzcyOX0.CVVuiLpEMar99W5QxTmeZGO9SPXG7SSgjKiXa8KlJAk	2026-04-27 12:42:09.860226+00	2026-04-20 12:42:09.860226+00
8	7e5d1974-b943-47bf-843d-e7050cdf5b8a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3ZTVkMTk3NC1iOTQzLTQ3YmYtODQzZC1lNzA1MGNkZjViOGEiLCJpYXQiOjE3NzY3NDY4NjgsImV4cCI6MTc3NzM1MTY2OH0.zeR3JxnYFuqKxPEUQcOWvM4TVPk4Ro5mC8g2cYIwS58	2026-04-28 04:47:48.703433+00	2026-04-20 16:14:10.822947+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, phone, password_hash, first_name, last_name, user_type, is_active, is_verified, failed_login_attempts, locked_until, last_login_at, created_at, updated_at) FROM stdin;
7ac8120e-6d82-4243-b703-822af1b20d08	admin@materialking.in	9999999999	$2a$06$zsYUveL8LvNAcrrJ4QOtbu8gs4CN4etBvdgQc.40BddlwB5P5l/CK	Admin	MK	admin	t	t	0	\N	2026-04-07 13:05:30.556104+00	2026-04-06 14:01:46.770485+00	2026-04-06 14:01:46.770485+00
f897a92f-38fe-4bfa-a7d7-17cc905776c2	kreonadmin@materialking.in	9999999998	$2a$06$aHLaNrhvXqoPCRCX/MAs5O1C/s7R46Mo7FmsEX5ZLy9rYlCAtL0eO	Kreon	Admin	admin	t	t	0	\N	2026-04-20 12:42:09.766297+00	2026-04-06 14:01:46.770485+00	2026-04-06 14:01:46.770485+00
7e5d1974-b943-47bf-843d-e7050cdf5b8a	viviya@gmail.com	9876543210	$2a$10$usU2cNNbUXPmiG70uC84cOwchhquGJWcPNvk4da.JQQufyt5h5To2	Viviya	Wadkar	buyer	t	t	0	\N	2026-04-20 16:14:10.808414+00	2026-04-06 13:25:38.645459+00	2026-04-06 13:25:38.645459+00
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendors (id, user_id, company_name, contact_name, email, phone, gstin, address, city, state, pincode, zone_id, is_active, is_verified, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wishlists (id, user_id, product_id, created_at) FROM stdin;
\.


--
-- Data for Name: zones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.zones (id, name, code, description, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Name: brands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.brands_id_seq', 20, true);


--
-- Name: buyer_addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.buyer_addresses_id_seq', 1, true);


--
-- Name: buyers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.buyers_id_seq', 1, true);


--
-- Name: cart_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cart_items_id_seq', 6, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 51, true);


--
-- Name: coupons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.coupons_id_seq', 8, true);


--
-- Name: dealers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.dealers_id_seq', 1, false);


--
-- Name: inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inventory_id_seq', 1, false);


--
-- Name: inventory_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inventory_transactions_id_seq', 4, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_items_id_seq', 4, true);


--
-- Name: order_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_status_history_id_seq', 1, false);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, true);


--
-- Name: pricing_tiers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pricing_tiers_id_seq', 3, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 55, true);


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_roles_id_seq', 3, true);


--
-- Name: user_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_sessions_id_seq', 8, true);


--
-- Name: vendors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vendors_id_seq', 1, false);


--
-- Name: wishlists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.wishlists_id_seq', 1, false);


--
-- Name: zones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.zones_id_seq', 1, false);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: brands brands_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_slug_key UNIQUE (slug);


--
-- Name: buyer_addresses buyer_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buyer_addresses
    ADD CONSTRAINT buyer_addresses_pkey PRIMARY KEY (id);


--
-- Name: buyers buyers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buyers
    ADD CONSTRAINT buyers_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_user_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_product_id_key UNIQUE (user_id, product_id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: coupons coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key UNIQUE (code);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: dealers dealers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dealers
    ADD CONSTRAINT dealers_pkey PRIMARY KEY (id);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- Name: inventory inventory_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_product_id_key UNIQUE (product_id);


--
-- Name: inventory_transactions inventory_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: pricing_tiers pricing_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_tiers
    ADD CONSTRAINT pricing_tiers_pkey PRIMARY KEY (id);


--
-- Name: pricing_tiers pricing_tiers_product_id_min_qty_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_tiers
    ADD CONSTRAINT pricing_tiers_product_id_min_qty_key UNIQUE (product_id, min_qty);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- Name: products products_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key UNIQUE (slug);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: wishlists wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_pkey PRIMARY KEY (id);


--
-- Name: wishlists wishlists_user_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_user_id_product_id_key UNIQUE (user_id, product_id);


--
-- Name: zones zones_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_code_key UNIQUE (code);


--
-- Name: zones zones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_pkey PRIMARY KEY (id);


--
-- Name: idx_buyer_addresses_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_buyer_addresses_user ON public.buyer_addresses USING btree (user_id);


--
-- Name: idx_cart_items_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_items_user ON public.cart_items USING btree (user_id);


--
-- Name: idx_coupons_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_coupons_code ON public.coupons USING btree (code);


--
-- Name: idx_inventory_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_product ON public.inventory USING btree (product_id);


--
-- Name: idx_inventory_transactions_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_transactions_product ON public.inventory_transactions USING btree (product_id);


--
-- Name: idx_inventory_transactions_ref; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_transactions_ref ON public.inventory_transactions USING btree (reference_type, reference_id);


--
-- Name: idx_order_status_history_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_status_history_order ON public.order_status_history USING btree (order_id);


--
-- Name: idx_orders_buyer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_buyer ON public.orders USING btree (buyer_id);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_pricing_tiers_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pricing_tiers_product ON public.pricing_tiers USING btree (product_id);


--
-- Name: idx_products_brand; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_brand ON public.products USING btree (brand_id);


--
-- Name: idx_products_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_category ON public.products USING btree (category_id);


--
-- Name: idx_products_vendor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_vendor ON public.products USING btree (vendor_id);


--
-- Name: idx_user_roles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);


--
-- Name: idx_user_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_phone ON public.users USING btree (phone);


--
-- Name: idx_wishlists_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wishlists_product ON public.wishlists USING btree (product_id);


--
-- Name: idx_wishlists_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wishlists_user ON public.wishlists USING btree (user_id);


--
-- Name: buyer_addresses buyer_addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buyer_addresses
    ADD CONSTRAINT buyer_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: buyers buyers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buyers
    ADD CONSTRAINT buyers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: buyers buyers_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buyers
    ADD CONSTRAINT buyers_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.zones(id) ON DELETE SET NULL;


--
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: dealers dealers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dealers
    ADD CONSTRAINT dealers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: dealers dealers_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dealers
    ADD CONSTRAINT dealers_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.zones(id) ON DELETE SET NULL;


--
-- Name: inventory inventory_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: inventory_transactions inventory_transactions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: inventory_transactions inventory_transactions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: order_status_history order_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: order_status_history order_status_history_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: orders orders_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.buyers(id) ON DELETE SET NULL;


--
-- Name: orders orders_dealer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_dealer_id_fkey FOREIGN KEY (dealer_id) REFERENCES public.dealers(id) ON DELETE SET NULL;


--
-- Name: orders orders_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE SET NULL;


--
-- Name: pricing_tiers pricing_tiers_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_tiers
    ADD CONSTRAINT pricing_tiers_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: products products_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: vendors vendors_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vendors vendors_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.zones(id) ON DELETE SET NULL;


--
-- Name: wishlists wishlists_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: wishlists wishlists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict icE2td8amGPuWeIMdVOoI2FZAK3Byftn3qT5BDiZUGkfpX4syxPwwOzLGLfd9G9

