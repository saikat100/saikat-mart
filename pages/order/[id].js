import {
	Alert,
	Card,
	CircularProgress,
	Grid,
	Link,
	List,
	ListItem,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from "@mui/material";
import NextLink from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { useContext, useEffect, useReducer } from "react";
import Layout from "../../components/Layout";
import classes from "../../utils/classes";
import { Store } from "../../utils/Store";
import { useRouter } from "next/router";
import { getError } from "../../utils/error";
import axios from "axios";

function reducer(state, action) {
	switch (action.type) {
		case "FETCH_REQUEST":
			return { ...state, loading: true, error: "" };
		case "FETCH_SUCCESS":
			return { ...state, loading: false, order: action.payload, error: "" };
		case "FETCH_FAIL":
			return { ...state, loading: false, error: action.payload };
	}
}
function OrderScreen({ params }) {
	const { id: orderId } = params;
	const [{ loading, error, order }, dispatch] = useReducer(reducer, {
		loading: true,
		order: {},
		error: "",
	});

	const {
		shippingAddress,
		paymentMethod,
		orderItems,
		itemsPrice,
		taxPrice,
		shippingPrice,
		totalPrice,
		isPaid,
		paidAt,
		isDelivered,
		deliveredAt,
	} = order;

	const router = useRouter();
	const { state } = useContext(Store);
	const { userInfo } = state;

	useEffect(() => {
		if (!userInfo) {
			return router.push("/login");
		}
		const fetchOrder = async () => {
			try {
				dispatch({ type: "FETCH_REQUEST" });
				const { data } = await axios.get(`/api/orders/${orderId}`, {
					headers: { authorization: `Bearer ${userInfo.token}` },
				});

				dispatch({ type: "FETCH_SUCCESS", payload: data });
			} catch (err) {
				dispatch({ type: "FETCH_FAIL", payload: getError(err) });
			}
		};
		fetchOrder();
	}, [orderId, router, userInfo]);
	return (
		<Layout title={`Order ${orderId}`}>
			<Typography component="h1" variant="h1">
				Order {orderId}
			</Typography>

			{loading ? (
				<CircularProgress />
			) : error ? (
				<Alert variant="error">{error}</Alert>
			) : (
				<Grid container spacing={1}>
					<Grid item md={9} xs={12}>
						<Card sx={classes.section}>
							<List>
								<ListItem>
									<Typography component="h2" variant="h2">
										Shipping Address
									</Typography>
								</ListItem>
								<ListItem>
									{shippingAddress.fullName}, {shippingAddress.address},{" "}
									{shippingAddress.city}, {shippingAddress.postalCode},{" "}
									{shippingAddress.country}
								</ListItem>
								<ListItem>
									Status:{" "}
									{isDelivered
										? `delivered at ${deliveredAt}`
										: "not delivered"}
								</ListItem>
							</List>
						</Card>

						<Card sx={classes.section}>
							<List>
								<ListItem>
									<Typography component="h2" variant="h2">
										Payment Method
									</Typography>
								</ListItem>
								<ListItem>{paymentMethod}</ListItem>
								<ListItem>
									Status: {isPaid ? `paid at ${paidAt}` : "not paid"}
								</ListItem>
							</List>
						</Card>

						<Card sx={classes.section}>
							<List>
								<ListItem>
									<Typography component="h2" variant="h2">
										Order Items
									</Typography>
								</ListItem>
								<ListItem>
									<TableContainer>
										<Table>
											<TableHead>
												<TableRow>
													<TableCell>Image</TableCell>
													<TableCell>Name</TableCell>
													<TableCell align="right">Quantity</TableCell>
													<TableCell align="right">Price</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{orderItems.map((item) => (
													<TableRow key={item._key}>
														<TableCell>
															<NextLink href={`/product/${item.slug}`} passHref>
																<Link>
																	<Image
																		src={item.image}
																		alt={item.name}
																		width={50}
																		height={50}
																	></Image>
																</Link>
															</NextLink>
														</TableCell>
														<TableCell>
															<NextLink href={`/product/${item.slug}`} passHref>
																<Link>
																	<Typography>{item.name}</Typography>
																</Link>
															</NextLink>
														</TableCell>
														<TableCell align="right">
															<Typography>{item.quantity}</Typography>
														</TableCell>
														<TableCell align="right">
															<Typography>${item.price}</Typography>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>
								</ListItem>
							</List>
						</Card>
					</Grid>
					<Grid item md={3} xs={12}>
						<Card sx={classes.section}>
							<List>
								<ListItem>
									<Typography variant="h2">Order Summary</Typography>
								</ListItem>
								<ListItem>
									<Grid container>
										<Grid item xs={6}>
											<Typography>Items:</Typography>
										</Grid>
										<Grid item xs={6}>
											<Typography align="right">${itemsPrice}</Typography>
										</Grid>
									</Grid>
								</ListItem>
								<ListItem>
									<Grid container>
										<Grid item xs={6}>
											<Typography>Tax:</Typography>
										</Grid>
										<Grid item xs={6}>
											<Typography align="right">${taxPrice}</Typography>
										</Grid>
									</Grid>
								</ListItem>
								<ListItem>
									<Grid container>
										<Grid item xs={6}>
											<Typography>Shipping:</Typography>
										</Grid>
										<Grid item xs={6}>
											<Typography align="right">${shippingPrice}</Typography>
										</Grid>
									</Grid>
								</ListItem>
								<ListItem>
									<Grid container>
										<Grid item xs={6}>
											<Typography>
												<strong>Total:</strong>
											</Typography>
										</Grid>
										<Grid item xs={6}>
											<Typography align="right">
												<strong>${totalPrice}</strong>
											</Typography>
										</Grid>
									</Grid>
								</ListItem>
							</List>
						</Card>
					</Grid>
				</Grid>
			)}
		</Layout>
	);
}
export function getServerSideProps({ params }) {
	return { props: { params } };
}

export default dynamic(() => Promise.resolve(OrderScreen), { ssr: false });
