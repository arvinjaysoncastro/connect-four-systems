# README.API.md — Backend System

## Overview
Backend is a Node.js (Express) service responsible for multiplayer coordination and persistence.

## Responsibilities
- Room management
- Move validation
- Game state persistence
- Multiplayer synchronization

## Constraints
- Hosted on Render (free tier)
- Subject to cold start delays

## Design Approach
- Stateless endpoints where possible
- Lightweight health check endpoint
- Designed for eventual scaling

## Future Enhancements
- WebSocket integration
- Persistent DB storage
- Horizontal scaling support

