import { Request, Response } from "express";
import { BadRequestError, UnauthorizedError } from "../helpers/api-errors";
import { transactionRepository } from "../repositories/transactionRepository";
import { Transaction } from "../entities/Transaction";

export class TransactionController {
  async create(req: Request, res: Response) {
    const user = req.user;
    const { type, amount, description, category } = req.body;

    if (!user) throw new UnauthorizedError("Não autorizado");

    if (description.length < 2) {
      throw new BadRequestError(
        "A descrição deve possuir mais de dois caracteres"
      );
    }

    if (amount <= 0) {
      throw new BadRequestError("Valor de transação deve ser maior que zero");
    }

    if (category.length < 2) {
      throw new BadRequestError(
        "A categoria deve possuir mais de dois caracteres"
      );
    }

    if (type !== "debit" && type !== "credit") {
      throw new BadRequestError("Tipo de transação Inválida");
    }

    const creditSum = await transactionRepository.sum("amount", {
      type: "credit",
      user: user,
    });

    const debitSum = await transactionRepository.sum("amount", {
      type: "debit",
      user: user,
    });

    const balance = creditSum! - debitSum!;

    if (balance < amount && type === "debit") {
      throw new UnauthorizedError("Saldo Insuficiente");
    }

    const newTransaction = transactionRepository.create({
      amount,
      category,
      description,
      type,
      user,
      created_at: new Date(),
    });

    await transactionRepository.save(newTransaction);

    return res.status(201).json(newTransaction);
  }

  async get(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;

      // Retorna todos os itens antes da página atual
      const skip = (Number(page) - 1) * Number(limit);

      const [transactions, totalTransactions] =
        await transactionRepository.findAndCount({
          where: { user: req.user },
          skip: skip, // Pula todos os itens antes da página atual
          take: Number(limit), // Define o máximo de itens a serem pegos
        });

      const totalPages = Math.ceil(totalTransactions / Number(limit));

      return res.json({
        transactions,
        totalPages,
        currentPage: Number(page),
        totalTransactions,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar transações." });
    }
  }

  async getLastsTransactions(req: Request, res: Response) {
    const transactions: Transaction[] = await transactionRepository.find({
      where: { user: req.user },
    });

    var lastDebitTransaction = {} as Transaction;
    var lastCreditTransaction = {} as Transaction;

    lastDebitTransaction = transactions.reduce(
      (prevObj, currentObj) => {
        if (currentObj.type === "debit") {
          return currentObj.id > prevObj.id
            ? {
                ...currentObj,
              }
            : prevObj;
        } else return prevObj;
      },
      { ...transactions[0], id: -1 }
    );

    lastCreditTransaction = transactions.reduce(
      (prevObj, currentObj) => {
        if (currentObj.type === "credit") {
          return currentObj.id > prevObj.id
            ? {
                ...currentObj,
              }
            : prevObj;
        } else return prevObj;
      },
      { ...transactions[0], id: -1 }
    );

    return res.json({
      lastDebitTransaction,
      lastCreditTransaction,
    });
  }

  async getByName(req: Request, res: Response) {
    const { search } = req.body;

    const transactions: Transaction[] = await transactionRepository.find({
      where: { user: req.user },
    });

    return res.json(
      transactions.filter((transaction) =>
        transaction.description.toLowerCase().includes(search.toLowerCase())
      )
    );
  }

  async getBalance(req: Request, res: Response) {
    const user = req.user;

    const creditSum = await transactionRepository.sum("amount", {
      type: "credit",
      user: user,
    });

    const debitSum = await transactionRepository.sum("amount", {
      type: "debit",
      user: user,
    });

    const balance = creditSum! - debitSum!;

    return res.json({ credits: creditSum, debits: debitSum, balance });
  }
}
